
const db = require('./backend/config/database');
const userId = 'caf65983-2c56-4fc9-8001-2d20cf1b175b';
async function test() {
  try {
    let settings = await db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);
    console.log('Settings:', settings);
  } catch (e) {
    console.log('Settings Error:', e.message);
  }
  try {
    const globalStats = await db.prepare('SELECT COUNT(id) as total_campaigns, COALESCE(SUM(sent_count), 0) as total_sent, COALESCE(SUM(failed_count), 0) as total_failed FROM campaigns WHERE user_id = ?').get(userId);
    console.log('Stats:', globalStats);
  } catch (e) {
    console.log('Stats Error:', e.message);
  }
}
test();

