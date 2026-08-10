// API Fetch Wrapper
class APIClient {
  constructor() {
    this.baseUrl = window.CONFIG?.API_BASE || '/api/v1';
    this.csrfToken = null;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.csrfToken && !['GET', 'HEAD'].includes(options.method)) {
      headers['X-CSRF-Token'] = this.csrfToken;
    }

    const config = {
      ...options,
      headers
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    if (config.body instanceof FormData) {
      delete headers['Content-Type']; // Let browser set multipart boundary
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Server request failed');
      }

      return data;
    } catch (error) {
      if (!options.silent) {
        console.error(`[API Error] ${endpoint}:`, error.message);
        if (window.toast) {
          window.toast.error(error.message || 'Network communication error');
        }
      }
      throw error;
    }
  }

  get(endpoint, options = {}) { return this.request(endpoint, { method: 'GET', ...options }); }
  post(endpoint, body, options = {}) { return this.request(endpoint, { method: 'POST', body, ...options }); }
  put(endpoint, body, options = {}) { return this.request(endpoint, { method: 'PUT', body, ...options }); }
  delete(endpoint, body, options = {}) { return this.request(endpoint, { method: 'DELETE', body, ...options }); }
}

window.api = new APIClient();
