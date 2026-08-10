const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'app.log');

function formatLog(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message} ${metaStr}`.trim();
}

function writeToFile(logLine) {
  try {
    fs.appendFileSync(logFile, logLine + '\n');
  } catch (e) {
    console.error('Failed to write log file:', e.message);
  }
}

const logger = {
  info: (msg, meta) => {
    const formatted = formatLog('info', msg, meta);
    console.log(formatted);
    writeToFile(formatted);
  },
  warn: (msg, meta) => {
    const formatted = formatLog('warn', msg, meta);
    console.warn(formatted);
    writeToFile(formatted);
  },
  error: (msg, meta) => {
    const formatted = formatLog('error', msg, meta);
    console.error(formatted);
    writeToFile(formatted);
  },
  audit: (action, userId, ip, meta = {}) => {
    const formatted = formatLog('AUDIT', `[Action: ${action}] [User: ${userId || 'ANONYMOUS'}] [IP: ${ip}]`, meta);
    console.log(formatted);
    writeToFile(formatted);
  }
};

module.exports = logger;
