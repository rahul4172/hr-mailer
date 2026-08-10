const queueEngine = require('../services/queueService');

/**
 * Start Campaign Queue
 */
async function startCampaign(req, res) {
  try {
    const { campaignId } = req.params;
    const userId = req.user.id;

    const result = await queueEngine.startCampaign(campaignId, userId);
    res.json({
      status: 'success',
      data: result
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

/**
 * Pause Campaign Queue
 */
async function pauseCampaign(req, res) {
  try {
    const { campaignId } = req.params;
    const result = await queueEngine.pauseCampaign(campaignId);
    res.json({
      status: 'success',
      data: result
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

/**
 * Resume Campaign Queue
 */
async function resumeCampaign(req, res) {
  try {
    const { campaignId } = req.params;
    const userId = req.user.id;
    const result = await queueEngine.startCampaign(campaignId, userId);
    res.json({
      status: 'success',
      data: result
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

/**
 * Cancel Campaign Queue
 */
async function cancelCampaign(req, res) {
  try {
    const { campaignId } = req.params;
    const result = await queueEngine.cancelCampaign(campaignId);
    res.json({
      status: 'success',
      data: result
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

/**
 * Fetch Real-Time Campaign Progress Metrics
 */
async function getProgress(req, res) {
  try {
    const { campaignId } = req.params;
    const progress = await queueEngine.getCampaignProgress(campaignId);
    if (!progress) {
      return res.status(404).json({ status: 'error', message: 'Campaign not found' });
    }
    res.json({
      status: 'success',
      progress
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

module.exports = {
  startCampaign,
  pauseCampaign,
  resumeCampaign,
  cancelCampaign,
  getProgress
};
