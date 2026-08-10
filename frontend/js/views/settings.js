// Lamborghini Settings View
async function renderSettingsView() {
  const container = document.getElementById('view-settings');
  if (!container) return;

  container.innerHTML = `
    <div class="animate-fade-in" style="max-width:840px; margin:0 auto;">
      <header class="page-header">
        <div>
          <h1 class="page-title">PREFERENCES & SETTINGS</h1>
          <p style="font-size: var(--text-large); color: var(--text-secondary); text-transform: uppercase;">
            CONTROLS FOR SEND DELAYS, RETRIES, AND DEFAULT SIGNATURE.
          </p>
        </div>
        <div>
          <button class="btn btn-secondary" onclick="window.commandPalette.open()" style="padding:0 24px;">⌘ K SHORTCUTS</button>
        </div>
      </header>

      <div class="premium-card" style="padding:var(--space-8); margin-bottom:var(--space-8);">
        
        <!-- Sending Engine Parameters -->
        <h3 style="font-size:var(--text-h5); font-family:var(--font-heading); margin-bottom:var(--space-8); text-transform:uppercase;">SENDING ENGINE JITTER DELAYS</h3>
        
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:var(--space-8);">
          <div>
            <label class="form-label" for="setting-min-delay" style="display:block; margin-bottom:var(--space-4);">MINIMUM DELAY (SECONDS)</label>
            <input type="number" id="setting-min-delay" class="glass-input" min="1" max="60" value="10" />
            <div style="margin-top:var(--space-2); color:var(--text-muted); font-size:var(--text-caption); text-transform:uppercase;">MINIMUM RANDOM PAUSE.</div>
          </div>

          <div>
            <label class="form-label" for="setting-max-delay" style="display:block; margin-bottom:var(--space-4);">MAXIMUM DELAY (SECONDS)</label>
            <input type="number" id="setting-max-delay" class="glass-input" min="1" max="120" value="25" />
            <div style="margin-top:var(--space-2); color:var(--text-muted); font-size:var(--text-caption); text-transform:uppercase;">MAXIMUM RANDOM PAUSE.</div>
          </div>

          <div>
            <label class="form-label" for="setting-max-retries" style="display:block; margin-bottom:var(--space-4);">MAX AUTO RETRIES</label>
            <input type="number" id="setting-max-retries" class="glass-input" min="1" max="5" value="3" />
            <div style="margin-top:var(--space-2); color:var(--text-muted); font-size:var(--text-caption); text-transform:uppercase;">RETRY COUNT ON TRANSIENT ERRORS.</div>
          </div>
        </div>

        <hr style="border:0; border-top:1px solid var(--border-strong); margin:var(--space-12) 0;" />

        <!-- Default Email Signature -->
        <h3 style="font-size:var(--text-h5); font-family:var(--font-heading); margin-bottom:var(--space-8); text-transform:uppercase;">DEFAULT EMAIL SIGNATURE</h3>
        <div>
          <textarea id="setting-signature" class="glass-input" style="height:120px;" placeholder="BEST REGARDS,\nYOUR NAME | GITHUB.COM"></textarea>
        </div>

        <div style="display:flex; justify-content:flex-end; margin-top:var(--space-8);">
          <button class="btn btn-primary" id="btn-save-settings" style="padding:0 32px;">SAVE PREFERENCES</button>
        </div>
      </div>
    </div>
  `;

  // Enforce dark mode
  localStorage.setItem('hrmailer_theme', 'dark');
  window.applyTheme('dark');

  // Fetch settings from API
  try {
    const data = await window.api.get('/settings');
    if (data.status === 'success' && data.settings) {
      const s = data.settings;
      document.getElementById('setting-min-delay').value = s.min_delay_sec || 10;
      document.getElementById('setting-max-delay').value = s.max_delay_sec || 25;
      document.getElementById('setting-max-retries').value = s.max_retries || 3;
      document.getElementById('setting-signature').value = s.default_signature || '';
    }
  } catch (e) {
    console.error('Settings load error:', e);
  }

  // Save settings handler
  document.getElementById('btn-save-settings').addEventListener('click', async () => {
    const minDelay = parseInt(document.getElementById('setting-min-delay').value, 10);
    const maxDelay = parseInt(document.getElementById('setting-max-delay').value, 10);
    const retries = parseInt(document.getElementById('setting-max-retries').value, 10);
    const sig = document.getElementById('setting-signature').value;

    if (minDelay >= maxDelay) {
      window.toast.warning('MINIMUM DELAY MUST BE LESS THAN MAXIMUM DELAY.');
      return;
    }

    try {
      await window.api.post('/settings', {
        minDelaySec: minDelay,
        maxDelaySec: maxDelay,
        maxRetries: retries,
        defaultSignature: sig,
        themePreference: 'dark'
      });
      window.toast.success('SETTINGS SAVED SUCCESSFULLY.');
    } catch (err) {
      console.error(err);
    }
  });
}

window.renderSettingsView = renderSettingsView;
