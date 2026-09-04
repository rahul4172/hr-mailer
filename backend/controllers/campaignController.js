const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { parseEmailList } = require('../services/parserService');
const { sanitizeInput } = require('../utils/validator');
const logger = require('../utils/logger');

/**
 * Parse Email Text API
 */
async function parseEmails(req, res) {
  try {
    const rawText = req.body.text || req.body.rawText;
    const result = parseEmailList(rawText);
    res.json({
      status: 'success',
      data: result
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

/**
 * Create New Campaign
 */
async function createCampaign(req, res) {
  try {
    const userId = req.user.id;
    const { title, subject, templateBody, signature, rawEmails, minDelaySec, maxDelaySec, maxRetries } = req.body;

    if (!title || !subject || !templateBody || !rawEmails) {
      return res.status(400).json({ status: 'error', message: 'Title, Subject, Email Body, and HR Email List are required.' });
    }

    const parsed = parseEmailList(rawEmails);
    if (parsed.valid === 0) {
      return res.status(400).json({ status: 'error', message: 'No valid HR email addresses found in the provided list.' });
    }

    // Weekly Limit Check (Rolling 7-day window)
    const pastCampaigns = await db.prepare(`
      SELECT SUM(valid_count) as total 
      FROM campaigns 
      WHERE user_id = ? AND created_at >= NOW() - INTERVAL '7 days'
    `).get(userId);

    const pastValidCount = parseInt(pastCampaigns.total || 0, 10);
    const newValidCount = parsed.valid;
    const WEEKLY_LIMIT = 150;

    if (pastValidCount + newValidCount > WEEKLY_LIMIT) {
      const remaining = Math.max(0, WEEKLY_LIMIT - pastValidCount);
      return res.status(400).json({ 
        status: 'error', 
        message: `Weekly limit exceeded. You can only queue ${WEEKLY_LIMIT} emails per rolling 7-day period. You have ${remaining} quota remaining, but attempted to add ${newValidCount}.` 
      });
    }

    const campaignId = uuidv4();
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedSubject = sanitizeInput(subject);
    const minDelay = parseInt(minDelaySec, 10) || 10;
    const maxDelay = parseInt(maxDelaySec, 10) || 25;
    const retries = parseInt(maxRetries, 10) || 3;

    // Insert Campaign Record
    await db.prepare(`
      INSERT INTO campaigns (
        id, user_id, title, subject, template_body, signature, status,
        total_count, valid_count, invalid_count, duplicate_count,
        min_delay_sec, max_delay_sec, max_retries
      ) VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?)
    `).run(
      campaignId,
      userId,
      sanitizedTitle,
      sanitizedSubject,
      templateBody, // Keep HTML markup intact for rich text
      signature || null,
      parsed.total,
      parsed.valid,
      parsed.invalid,
      parsed.duplicates,
      minDelay,
      maxDelay,
      retries
    );

    // Batch insert parsed recipients
    for (const recipient of parsed.recipients) {
      const emailId = uuidv4();
      await db.prepare(`
        INSERT INTO campaign_emails (id, campaign_id, recipient_email, company_name, recipient_name, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
      `).run(emailId, campaignId, recipient.email, recipient.company || null, recipient.name || null);
    }

    logger.info(`[CampaignController] Created campaign ${campaignId} with ${parsed.valid} recipients`);

    res.status(201).json({
      status: 'success',
      message: 'Campaign created successfully',
      campaignId: campaignId,
      stats: {
        total: parsed.total,
        valid: parsed.valid,
        invalid: parsed.invalid,
        duplicates: parsed.duplicates
      }
    });
  } catch (err) {
    logger.error('[Campaign Creation Error]', { error: err.message });
    res.status(500).json({ status: 'error', message: err.message });
  }
}

/**
 * List Campaigns with search & filter
 */
async function getCampaigns(req, res) {
  try {
    const userId = req.user.id;
    const { search, status } = req.query;

    let sql = 'SELECT * FROM campaigns WHERE user_id = ?';
    const params = [userId];

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (title LIKE ? OR subject LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY created_at DESC';

    const campaigns = await db.prepare(sql).all(...params);

    res.json({
      status: 'success',
      campaigns
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

/**
 * Get Single Campaign Detail
 */
async function getCampaignById(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const campaign = await db.prepare('SELECT * FROM campaigns WHERE id = ? AND user_id = ?').get(id, userId);
    if (!campaign) {
      return res.status(404).json({ status: 'error', message: 'Campaign not found' });
    }

    const emails = await db.prepare('SELECT * FROM campaign_emails WHERE campaign_id = ? ORDER BY created_at ASC').all(id);
    const attachments = await db.prepare('SELECT * FROM attachments WHERE campaign_id = ?').all(id);

    res.json({
      status: 'success',
      campaign,
      emails,
      attachments
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

/**
 * Delete Campaign
 */
async function deleteCampaign(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const campaign = await db.prepare('SELECT * FROM campaigns WHERE id = ? AND user_id = ?').get(id, userId);
    if (!campaign) {
      return res.status(404).json({ status: 'error', message: 'Campaign not found' });
    }

    await db.prepare('DELETE FROM campaigns WHERE id = ?').run(id);

    res.json({
      status: 'success',
      message: 'Campaign deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

/**
 * Bulk Delete Campaigns
 */
async function bulkDeleteCampaigns(req, res) {
  try {
    const userId = req.user.id;
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No campaign IDs provided' });
    }

    for (const id of ids) {
      await db.prepare('DELETE FROM campaigns WHERE id = ? AND user_id = ?').run(id, userId);
    }

    res.json({
      status: 'success',
      message: `${ids.length} campaigns deleted successfully`
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

/**
 * Get Overall Dashboard Stats
 */
async function getDashboardStats(req, res) {
  try {
    const userId = req.user.id;

    const totalCampaigns = await db.prepare('SELECT COUNT(*) as count FROM campaigns WHERE user_id = ?').get(userId);
    const totalEmailsSent = await db.prepare('SELECT SUM(sent_count) as total FROM campaigns WHERE user_id = ?').get(userId);
    const totalFailed = await db.prepare('SELECT SUM(failed_count) as total FROM campaigns WHERE user_id = ?').get(userId);
    const activeCampaigns = await db.prepare("SELECT COUNT(*) as count FROM campaigns WHERE user_id = ? AND status = 'running'").get(userId);

    const totalCampaignsVal = parseInt(totalCampaigns.count || 0, 10);
    const totalSentVal = parseInt(totalEmailsSent.total || 0, 10);
    const totalFailedVal = parseInt(totalFailed.total || 0, 10);
    const activeRunningVal = parseInt(activeCampaigns.count || 0, 10);

    const recentCampaigns = await db.prepare('SELECT * FROM campaigns WHERE user_id = ? ORDER BY created_at DESC LIMIT 5').all(userId);

    res.json({
      status: 'success',
      stats: {
        totalCampaigns: totalCampaignsVal,
        totalSent: totalSentVal,
        totalFailed: totalFailedVal,
        activeRunning: activeRunningVal,
        deliveryRate: totalSentVal > 0 ? Math.round((totalSentVal / (totalSentVal + totalFailedVal)) * 100) : 100
      },
      recentCampaigns
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

module.exports = {
  parseEmails,
  createCampaign,
  getCampaigns,
  getCampaignById,
  deleteCampaign,
  bulkDeleteCampaigns,
  getDashboardStats
};
