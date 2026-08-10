const db = require('../config/database');
const ProviderFactory = require('./emailService/providerFactory');
const { interpolateVariables } = require('../utils/validator');
const { decrypt } = require('../utils/crypto');
const logger = require('../utils/logger');

// In-memory active campaign run states
const activeCampaigns = new Map();

/**
 * Generate random integer jitter between min and max seconds
 */
function getRandomJitterMs(minSec = 10, maxSec = 25) {
  const min = Math.max(1, minSec);
  const max = Math.max(min, maxSec);
  const randomSec = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomSec * 1000;
}

/**
 * Queue Engine Class
 */
class SendingEngine {
  /**
   * Start or Resume a Campaign Queue
   */
  async startCampaign(campaignId, userId) {
    if (activeCampaigns.has(campaignId)) {
      const state = activeCampaigns.get(campaignId);
      if (state.status === 'paused') {
        state.status = 'running';
        await db.prepare('UPDATE campaigns SET status = ? WHERE id = ?').run('running', campaignId);
        logger.info(`[SendingEngine] Campaign ${campaignId} resumed.`);
        this.processQueue(campaignId);
        return { status: 'resumed' };
      }
      return { status: 'already_running' };
    }

    // Fetch Campaign details
    const campaign = await db.prepare('SELECT * FROM campaigns WHERE id = ? AND user_id = ?').get(campaignId, userId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    // Fetch User & OAuth Tokens
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Fetch Attachments
    const attachments = await db.prepare('SELECT * FROM attachments WHERE campaign_id = ?').all(campaignId);

    // Initialize State
    const state = {
      campaignId,
      userId,
      userEmail: user.email,
      authTokens: {
        accessToken: user.access_token,
        refreshToken: decrypt(user.refresh_token_encrypted)
      },
      campaign,
      attachments,
      status: 'running',
      startTime: Date.now(),
      processedCount: 0,
      sentCount: campaign.sent_count || 0,
      failedCount: campaign.failed_count || 0
    };

    activeCampaigns.set(campaignId, state);
    await db.prepare('UPDATE campaigns SET status = ? WHERE id = ?').run('running', campaignId);

    logger.info(`[SendingEngine] Campaign ${campaignId} started.`);
    
    // Trigger asynchronous queue loop
    this.processQueue(campaignId);

    return { status: 'started' };
  }

  /**
   * Main Process Queue Loop
   */
  async processQueue(campaignId) {
    const state = activeCampaigns.get(campaignId);
    if (!state) return;

    const provider = ProviderFactory.getProvider('gmail');

    while (state.status === 'running') {
      // Pick next pending email recipient
      const emailRecord = await db.prepare(`
        SELECT * FROM campaign_emails 
        WHERE campaign_id = ? AND status = 'pending' 
        ORDER BY created_at ASC LIMIT 1
      `).get(campaignId);

      // If no more pending emails, campaign completes!
      if (!emailRecord) {
        state.status = 'completed';
        await db.prepare('UPDATE campaigns SET status = ? WHERE id = ?').run('completed', campaignId);
        logger.info(`[SendingEngine] Campaign ${campaignId} completed!`);
        activeCampaigns.delete(campaignId);
        break;
      }

      // Update status to 'sending'
      await db.prepare('UPDATE campaign_emails SET status = ? WHERE id = ?').run('sending', emailRecord.id);

      // Personalize Subject & Body
      const variables = {
        company: emailRecord.company_name || '',
        name: emailRecord.recipient_name || '',
        email: emailRecord.recipient_email
      };

      const personalizedSubject = interpolateVariables(state.campaign.subject, variables);
      let personalizedBody = interpolateVariables(state.campaign.template_body, variables);

      // Append default signature if present
      if (state.campaign.signature) {
        personalizedBody += `<br><br>${state.campaign.signature.replace(/\n/g, '<br>')}`;
      }

      // Store calculated subject & body
      await db.prepare(`
        UPDATE campaign_emails 
        SET personalized_subject = ?, personalized_body = ? 
        WHERE id = ?
      `).run(personalizedSubject, personalizedBody, emailRecord.id);

      // Send with retry loop (up to max_retries)
      let sendSuccess = false;
      let lastError = '';
      const maxRetries = state.campaign.max_retries || 3;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        // Stop check
        if (state.status !== 'running') break;

        const result = await provider.sendEmail({
          from: state.userEmail,
          to: emailRecord.recipient_email,
          subject: personalizedSubject,
          body: personalizedBody,
          attachments: state.attachments,
          authTokens: state.authTokens
        });

        if (result.success) {
          sendSuccess = true;
          break;
        } else {
          lastError = result.error || 'Failed to send';
          await db.prepare('UPDATE campaign_emails SET attempts = attempts + 1 WHERE id = ?').run(emailRecord.id);
          // Wait 2 seconds before retrying
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      // Record final email attempt result
      if (sendSuccess) {
        state.sentCount++;
        await db.prepare(`
          UPDATE campaign_emails 
          SET status = 'sent', sent_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `).run(emailRecord.id);

        await db.prepare('UPDATE campaigns SET sent_count = sent_count + 1 WHERE id = ?').run(campaignId);
      } else {
        state.failedCount++;
        await db.prepare(`
          UPDATE campaign_emails 
          SET status = 'failed', error_reason = ? 
          WHERE id = ?
        `).run(lastError, emailRecord.id);

        await db.prepare('UPDATE campaigns SET failed_count = failed_count + 1 WHERE id = ?').run(campaignId);
      }

      state.processedCount++;

      // Check if paused or cancelled during execution
      if (state.status !== 'running') {
        logger.info(`[SendingEngine] Campaign ${campaignId} paused/cancelled during processing.`);
        break;
      }

      // Jitter Delay between 10s and 25s (or campaign custom min/max delay)
      const delayMs = getRandomJitterMs(state.campaign.min_delay_sec, state.campaign.max_delay_sec);
      logger.info(`[SendingEngine] Waiting ${Math.round(delayMs / 1000)}s jitter before sending next email...`);

      // Interrupted sleep for responsive pause/cancel
      const slice = 500;
      let waited = 0;
      while (waited < delayMs && state.status === 'running') {
        await new Promise(res => setTimeout(res, slice));
        waited += slice;
      }
    }
  }

  /**
   * Pause Campaign
   */
  async pauseCampaign(campaignId) {
    const state = activeCampaigns.get(campaignId);
    if (state) {
      state.status = 'paused';
    }
    await db.prepare('UPDATE campaigns SET status = ? WHERE id = ?').run('paused', campaignId);
    logger.info(`[SendingEngine] Campaign ${campaignId} paused.`);
    return { status: 'paused' };
  }

  /**
   * Cancel Campaign
   */
  async cancelCampaign(campaignId) {
    const state = activeCampaigns.get(campaignId);
    if (state) {
      state.status = 'cancelled';
      activeCampaigns.delete(campaignId);
    }
    await db.prepare('UPDATE campaigns SET status = ? WHERE id = ?').run('cancelled', campaignId);
    logger.info(`[SendingEngine] Campaign ${campaignId} cancelled.`);
    return { status: 'cancelled' };
  }

  /**
   * Get Live Campaign Status & Real-time Metrics
   */
  async getCampaignProgress(campaignId) {
    const campaign = await db.prepare('SELECT * FROM campaigns WHERE id = ?').get(campaignId);
    if (!campaign) return null;

    const emailStats = await db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'sending' THEN 1 ELSE 0 END) as sending
      FROM campaign_emails
      WHERE campaign_id = ?
    `).get(campaignId);

    const state = activeCampaigns.get(campaignId);
    const elapsedTimeSec = state ? Math.floor((Date.now() - state.startTime) / 1000) : 0;
    
    const sent = emailStats.sent || 0;
    const total = campaign.total_count || 0;
    const remaining = emailStats.pending + emailStats.sending;

    // Calculate Speed (emails per minute)
    let speedEpm = 0;
    if (elapsedTimeSec > 0 && sent > 0) {
      speedEpm = Math.round((sent / elapsedTimeSec) * 60 * 10) / 10;
    }

    // Calculate Estimated Time Remaining (ETA)
    let estimatedSecRemaining = 0;
    if (remaining > 0) {
      const avgDelaySec = (campaign.min_delay_sec + campaign.max_delay_sec) / 2;
      estimatedSecRemaining = Math.round(remaining * avgDelaySec);
    }

    return {
      campaignId,
      status: state ? state.status : campaign.status,
      total,
      sent,
      failed: emailStats.failed || 0,
      remaining,
      elapsedTimeSec,
      estimatedSecRemaining,
      speedEpm: speedEpm || 2.4, // Default estimation benchmark
      percentComplete: total > 0 ? Math.round((sent / total) * 100) : 0
    };
  }
}

const instance = new SendingEngine();
module.exports = instance;
