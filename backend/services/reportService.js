const XLSX = require('xlsx');
const db = require('../config/database');

/**
 * Generate CSV content string for a campaign
 */
async function generateCampaignCsv(campaignId) {
  const campaign = await db.prepare('SELECT * FROM campaigns WHERE id = ?').get(campaignId);
  if (!campaign) throw new Error('Campaign not found');

  const emails = await db.prepare(`
    SELECT recipient_email, company_name, recipient_name, status, attempts, error_reason, sent_at, created_at
    FROM campaign_emails
    WHERE campaign_id = ?
    ORDER BY created_at ASC
  `).all(campaignId);

  const headers = ['Recipient Email', 'Company Name', 'Recipient Name', 'Status', 'Attempts', 'Error Reason', 'Sent At'];
  const rows = [headers.join(',')];

  for (const item of emails) {
    const row = [
      `"${item.recipient_email || ''}"`,
      `"${item.company_name || ''}"`,
      `"${item.recipient_name || ''}"`,
      `"${item.status || ''}"`,
      item.attempts || 0,
      `"${(item.error_reason || '').replace(/"/g, '""')}"`,
      `"${item.sent_at || ''}"`
    ];
    rows.push(row.join(','));
  }

  return rows.join('\n');
}

/**
 * Generate Excel Buffer for a campaign
 */
async function generateCampaignExcel(campaignId) {
  const campaign = await db.prepare('SELECT * FROM campaigns WHERE id = ?').get(campaignId);
  if (!campaign) throw new Error('Campaign not found');

  const emails = await db.prepare(`
    SELECT recipient_email, company_name, recipient_name, status, attempts, error_reason, sent_at
    FROM campaign_emails
    WHERE campaign_id = ?
    ORDER BY created_at ASC
  `).all(campaignId);

  const data = emails.map(item => ({
    'Email Address': item.recipient_email,
    'Company': item.company_name || 'N/A',
    'Recipient Name': item.recipient_name || 'N/A',
    'Status': item.status.toUpperCase(),
    'Attempts': item.attempts,
    'Failure Reason': item.error_reason || 'N/A',
    'Sent Timestamp': item.sent_at || 'Pending'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Campaign Report');

  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return excelBuffer;
}

module.exports = {
  generateCampaignCsv,
  generateCampaignExcel
};
