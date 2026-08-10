const db = require('../config/database');
const { sanitizeInput } = require('../utils/validator');

/**
 * Get User Settings
 */
async function getSettings(req, res) {
  try {
    const userId = req.user.id;
    let settings = await db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);

    if (!settings) {
      // Default settings fallback
      settings = {
        min_delay_sec: 10,
        max_delay_sec: 25,
        max_retries: 3,
        default_signature: `Best regards,\n${req.user.name}`,
        theme_preference: 'auto',
        sound_notifications: 1,
        desktop_notifications: 1
      };
    }

    res.json({
      status: 'success',
      settings
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

/**
 * Update User Settings
 */
async function updateSettings(req, res) {
  try {
    const userId = req.user.id;
    const { minDelaySec, maxDelaySec, maxRetries, defaultSignature, themePreference, soundNotifications, desktopNotifications } = req.body;

    const minDelay = parseInt(minDelaySec, 10) || 10;
    const maxDelay = parseInt(maxDelaySec, 10) || 25;
    const retries = parseInt(maxRetries, 10) || 3;
    const theme = ['auto', 'dark', 'light'].includes(themePreference) ? themePreference : 'auto';
    const signature = sanitizeInput(defaultSignature || '');

    const existing = await db.prepare('SELECT id FROM user_settings WHERE user_id = ?').get(userId);

    if (existing) {
      await db.prepare(`
        UPDATE user_settings 
        SET min_delay_sec = ?, max_delay_sec = ?, max_retries = ?, 
            default_signature = ?, theme_preference = ?, 
            sound_notifications = ?, desktop_notifications = ?, 
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(
        minDelay,
        maxDelay,
        retries,
        signature,
        theme,
        soundNotifications ? 1 : 0,
        desktopNotifications ? 1 : 0,
        userId
      );
    } else {
      const { v4: uuidv4 } = require('uuid');
      await db.prepare(`
        INSERT INTO user_settings (
          id, user_id, min_delay_sec, max_delay_sec, max_retries, 
          default_signature, theme_preference, sound_notifications, desktop_notifications
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        uuidv4(),
        userId,
        minDelay,
        maxDelay,
        retries,
        signature,
        theme,
        soundNotifications ? 1 : 0,
        desktopNotifications ? 1 : 0
      );
    }

    res.json({
      status: 'success',
      message: 'Settings updated successfully'
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

module.exports = {
  getSettings,
  updateSettings
};
