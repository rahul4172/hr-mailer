// Raycast-Style Command Palette Component (Cmd + K)
class CommandPalette {
  constructor() {
    this.active = false;
    this.selectedIndex = 0;
    this.actions = [
      { id: 'nav-dashboard', title: 'Go to Dashboard', icon: '🏠', shortcut: 'G D', action: () => window.appRouter.navigate('dashboard') },
      { id: 'nav-campaign', title: 'Create New Campaign', icon: '🚀', shortcut: 'Ctrl+Shift+N', action: () => window.appRouter.navigate('campaign') },
      { id: 'nav-history', title: 'View Campaign History', icon: '📋', shortcut: 'G H', action: () => window.appRouter.navigate('history') },
      { id: 'nav-reports', title: 'Export Reports', icon: '📊', shortcut: 'G R', action: () => window.appRouter.navigate('reports') },
      { id: 'nav-settings', title: 'Open Settings & Preferences', icon: '⚙️', shortcut: 'G S', action: () => window.appRouter.navigate('settings') },
      { id: 'theme-dark', title: 'Switch to Dark Theme', icon: '🌙', shortcut: 'T D', action: () => { localStorage.setItem('hrmailer_theme', 'dark'); window.applyTheme('dark'); } },
      { id: 'theme-light', title: 'Switch to Light Theme', icon: '☀️', shortcut: 'T L', action: () => { localStorage.setItem('hrmailer_theme', 'light'); window.applyTheme('light'); } }
    ];

    this.initUI();
    this.attachEvents();
  }

  initUI() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'cmd-palette-overlay';
    this.overlay.id = 'command-palette-modal';

    this.overlay.innerHTML = `
      <div class="cmd-palette-card">
        <div class="cmd-input-wrapper">
          <span style="font-size:1.2rem;">🔍</span>
          <input type="text" class="cmd-input" id="cmd-palette-input" placeholder="Type a command or search actions..." />
          <span class="cmd-kbd">ESC</span>
        </div>
        <ul class="cmd-results-list" id="cmd-palette-results"></ul>
        <div style="padding:0.75rem 1.25rem; border-top:1px solid var(--glass-border); font-size:0.75rem; color:var(--text-muted); display:flex; justify-content:space-between;">
          <span>Navigation: <kbd class="cmd-kbd">↑</kbd> <kbd class="cmd-kbd">↓</kbd></span>
          <span>Select: <kbd class="cmd-kbd">↵ Enter</kbd></span>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);
    this.input = this.overlay.querySelector('#cmd-palette-input');
    this.resultsList = this.overlay.querySelector('#cmd-palette-results');
  }

  attachEvents() {
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.toggle();
      } else if (e.key === 'Escape' && this.active) {
        this.close();
      }
    });

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    this.input.addEventListener('input', () => this.renderResults());
    this.input.addEventListener('keydown', (e) => this.handleKeyNavigation(e));
  }

  toggle() {
    if (this.active) this.close();
    else this.open();
  }

  open() {
    this.active = true;
    this.selectedIndex = 0;
    this.input.value = '';
    this.overlay.classList.add('active');
    this.renderResults();
    setTimeout(() => this.input.focus(), 50);
  }

  close() {
    this.active = false;
    this.overlay.classList.remove('active');
  }

  renderResults() {
    const query = this.input.value.toLowerCase().trim();
    const filtered = this.actions.filter(a => a.title.toLowerCase().includes(query));

    if (filtered.length === 0) {
      this.resultsList.innerHTML = `<li style="padding:1.5rem; text-align:center; color:var(--text-muted); font-size:0.9rem;">No matching commands found.</li>`;
      return;
    }

    if (this.selectedIndex >= filtered.length) this.selectedIndex = 0;

    this.resultsList.innerHTML = filtered.map((item, index) => `
      <li class="cmd-item ${index === this.selectedIndex ? 'selected' : ''}" data-index="${index}">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <span style="font-size:1.1rem;">${item.icon}</span>
          <span style="font-weight:600; font-size:0.95rem;">${item.title}</span>
        </div>
        <span class="cmd-kbd">${item.shortcut || ''}</span>
      </li>
    `).join('');

    this.resultsList.querySelectorAll('.cmd-item').forEach((el, index) => {
      el.addEventListener('click', () => {
        filtered[index].action();
        this.close();
      });
    });
  }

  handleKeyNavigation(e) {
    const query = this.input.value.toLowerCase().trim();
    const filtered = this.actions.filter(a => a.title.toLowerCase().includes(query));

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.selectedIndex = (this.selectedIndex + 1) % filtered.length;
      this.renderResults();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.selectedIndex = (this.selectedIndex - 1 + filtered.length) % filtered.length;
      this.renderResults();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[this.selectedIndex]) {
        filtered[this.selectedIndex].action();
        this.close();
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.commandPalette = new CommandPalette();
});
