const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const campaignController = require('../controllers/campaignController');
const sendController = require('../controllers/sendController');
const uploadController = require('../controllers/uploadController');
const reportController = require('../controllers/reportController');
const settingsController = require('../controllers/settingsController');

const { authMiddleware } = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'HR Mailer Pro API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Authentication Routes
router.get('/auth/google', authController.googleLogin);
router.get('/auth/google/callback', authController.googleCallback);
router.get('/auth/status', authMiddleware, authController.getAuthStatus);
router.post('/auth/logout', authMiddleware, authController.logout);

// Protected Routes (Require Authentication)
router.use(authMiddleware);

// Campaigns
router.post('/campaigns/parse-emails', campaignController.parseEmails);
router.post('/campaigns', campaignController.createCampaign);
router.get('/campaigns', campaignController.getCampaigns);
router.get('/campaigns/stats/summary', campaignController.getDashboardStats);
router.get('/campaigns/:id', campaignController.getCampaignById);
router.delete('/campaigns/bulk-delete', campaignController.bulkDeleteCampaigns);
router.delete('/campaigns/:id', campaignController.deleteCampaign);

// Sending Engine & Queue Controls
router.post('/send/start/:campaignId', sendController.startCampaign);
router.post('/send/pause/:campaignId', sendController.pauseCampaign);
router.post('/send/resume/:campaignId', sendController.resumeCampaign);
router.post('/send/cancel/:campaignId', sendController.cancelCampaign);
router.get('/send/progress/:campaignId', sendController.getProgress);

// Uploads
router.post('/upload', uploadMiddleware.single('file'), uploadController.uploadFile);
router.delete('/upload/:id', uploadController.deleteAttachment);

// Reports Export
router.get('/reports/campaign/:campaignId/csv', reportController.downloadCsv);
router.get('/reports/campaign/:campaignId/excel', reportController.downloadExcel);

// User Settings
router.get('/settings', settingsController.getSettings);
router.post('/settings', settingsController.updateSettings);

module.exports = router;
