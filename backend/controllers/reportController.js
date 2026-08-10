const { generateCampaignCsv, generateCampaignExcel } = require('../services/reportService');

/**
 * Download Campaign Report as CSV
 */
async function downloadCsv(req, res) {
  try {
    const { campaignId } = req.params;
    const csvContent = await generateCampaignCsv(campaignId);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="campaign-${campaignId}-report.csv"`);
    res.status(200).send(csvContent);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

/**
 * Download Campaign Report as Excel (XLSX)
 */
async function downloadExcel(req, res) {
  try {
    const { campaignId } = req.params;
    const excelBuffer = await generateCampaignExcel(campaignId);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="campaign-${campaignId}-report.xlsx"`);
    res.status(200).send(excelBuffer);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

module.exports = {
  downloadCsv,
  downloadExcel
};
