// Main SPA Router & Luxury Initialization V3
class AppRouter {
  constructor() {
    this.routes = {
      'landing': window.renderLandingView,
      'login': window.renderLoginView,
      'dashboard': window.renderDashboardView,
      'campaign': window.renderCampaignView,
      'composer': window.renderComposerView,
      'attachments': window.renderAttachmentsView,
      'progress': window.renderProgressView,
      'history': window.renderHistoryView,
      'reports': window.renderReportsView,
      'settings': window.renderSettingsView
    };

    window.addEventListener('hashchange', () => this.handleRoute());
  }

  navigate(routeName, params = {}) {
    window.location.hash = routeName;
    this.currentParams = params;
  }

  async handleRoute() {
    let hash = window.location.hash.replace('#', '') || 'landing';
    
    // Check Auth status from API
    try {
      const auth = await window.api.get('/auth/status', { silent: true });
      if (auth.authenticated) {
        window.store.setState({ user: auth.user, settings: auth.settings, authenticated: true });
        if (hash === 'landing') hash = 'dashboard';
        this.updateNavUI(true, auth.user);
      } else {
        window.store.setState({ authenticated: false });
        if (hash !== 'landing' && hash !== 'login') hash = 'landing';
        this.updateNavUI(false);
      }
    } catch (e) {
      this.updateNavUI(false);
    }

    // Hide all view panels
    document.querySelectorAll('.page-view').forEach(el => el.classList.remove('active'));

    const activeView = document.getElementById(`view-${hash}`);
    if (activeView) {
      activeView.classList.add('active');
      const renderFn = this.routes[hash];
      if (renderFn) {
        try {
          // Await in case it's an async render function
          const res = renderFn(this.currentParams || {});
          if (res instanceof Promise) {
            await res;
          }
        } catch (renderError) {
          console.error(`Error rendering view ${hash}:`, renderError);
          window.toast.error('Failed to render view.');
        }
      }
    }

    // Update active sidebar links
    let routeTitle = 'Dashboard';
    document.querySelectorAll('.sidebar-item').forEach(el => {
      // Ensure robust click handling
      el.onclick = (e) => {
        const route = el.getAttribute('data-route');
        if (route) window.appRouter.navigate(route);
      };

      const isMatch = el.getAttribute('data-route') === hash;
      if (isMatch) {
        el.classList.add('active');
        routeTitle = el.textContent.trim();
      } else {
        el.classList.remove('active');
      }
    });

    // Close sidebar on navigation
    const sidebar = document.getElementById('desktop-sidebar');
    if (sidebar) sidebar.classList.remove('open');

    // Render Lucide Icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Reset workspace scroll
    const workspace = document.querySelector('.main-workspace');
    if (workspace) workspace.scrollTop = 0;
  }

  updateNavUI(authenticated, user = {}) {
    if (authenticated) {
      document.body.classList.remove('unauthenticated');
      const userEmailEl = document.getElementById('sidebar-user-email');
      if (userEmailEl) userEmailEl.innerText = user.email || '';
    } else {
      document.body.classList.add('unauthenticated');
    }
  }
}

// Global Theme Engine Switcher
window.applyTheme = function(theme) {
  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('hrmailer_theme') || 'auto';
  window.applyTheme(savedTheme);

  window.appRouter = new AppRouter();

  // App initialization and server polling
  const initializeApp = async () => {
    const loader = document.getElementById('global-loader');
    let serverIsAwake = false;
    let attempts = 0;
    const maxAttempts = 30; // Wait up to 30s roughly if polling every 1s
    
    while (!serverIsAwake && attempts < maxAttempts) {
      try {
        // Use native fetch to avoid window.api throwing on 401 Unauthorized
        await fetch((window.CONFIG?.API_BASE || '/api/v1') + '/auth/status');
        serverIsAwake = true;
      } catch (e) {
        attempts++;
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    if (serverIsAwake) {
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 400);
      }
      window.appRouter.handleRoute();
    } else {
      // If server never wakes up, we can still hide the loader but it'll probably fail to load routes
      if (loader) loader.innerHTML = `<div style="color:var(--color-error); font-weight:600; font-family:var(--font-heading);">Server unreachable. Please check backend.</div>`;
    }
  };

  initializeApp();

  if (window.lucide) window.lucide.createIcons();

  // Setup Logout Handlers
  const handleLogout = async () => {
    try {
      await window.api.post('/auth/logout');
    } catch (e) {
      console.warn('Logout API failed (likely already logged out)', e);
    }
    window.toast.info('LOGGED OUT.');
    window.appRouter.navigate('login');
  };

  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  // Hamburger Menu Toggles
  const btnToggleMenu = document.getElementById('btn-toggle-menu');
  const btnCloseMenu = document.getElementById('btn-close-menu');
  const sidebar = document.getElementById('desktop-sidebar');

  if (btnToggleMenu && sidebar) {
    btnToggleMenu.addEventListener('click', () => sidebar.classList.add('open'));
  }
  if (btnCloseMenu && sidebar) {
    btnCloseMenu.addEventListener('click', () => sidebar.classList.remove('open'));
  }

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.metaKey && e.key === 'k') {
      e.preventDefault();
      window.commandPalette.open();
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'N') {
      e.preventDefault();
      window.appRouter.navigate('campaign');
    }
  });
});
