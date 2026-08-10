const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');

/**
 * Upload Attachment File
 */
async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file attached or unsupported file type.' });
    }

    const { campaignId } = req.body;
    const file = req.file;

    const attachmentId = uuidv4();

    if (campaignId) {
      await db.prepare(`
        INSERT INTO attachments (id, campaign_id, filename, original_name, file_path, mime_type, file_size)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        attachmentId,
        campaignId,
        file.filename,
        file.originalname,
        file.path,
        file.mimetype,
        file.size
      );
    }

    res.json({
      status: 'success',
      attachment: {
        id: attachmentId,
        filename: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        mimeType: file.mimetype,
        fileSize: file.size,
        sizeMb: (file.size / (1024 * 1024)).toFixed(2)
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

/**
 * Delete Attachment
 */
async function deleteAttachment(req, res) {
  try {
    const { id } = req.params;
    const attachment = await db.prepare('SELECT * FROM attachments WHERE id = ?').get(id);

    if (attachment) {
      if (fs.existsSync(attachment.file_path)) {
        fs.unlinkSync(attachment.file_path);
      }
      await db.prepare('DELETE FROM attachments WHERE id = ?').run(id);
    }

    res.json({
      status: 'success',
      message: 'Attachment deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

module.exports = {
  uploadFile,
  deleteAttachment
};
