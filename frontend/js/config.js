// Global Config & Constants
const CONFIG = {
  API_BASE: '/api/v1',
  APP_NAME: 'HR Mailer Pro',
  VERSION: '1.0.0',
  DEFAULT_MIN_DELAY: 10,
  DEFAULT_MAX_DELAY: 25,
  DEFAULT_RETRIES: 3,
  MAX_FILE_SIZE_MB: 20
};

if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
