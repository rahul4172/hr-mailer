// Lamborghini Progress Monitor View
let progressPollInterval = null;

async function renderProgressView(params = {}) {
  const container = document.getElementById('view-progress');
  if (!container) return;

  const campaignId = params.campaignId || window.store.getState().activeCampaignId;

  if (!campaignId) {
    container.innerHTML = `
      <div class="animate-fade-up" style="text-align:center; padding:var(--space-12); margin-top:var(--space-12);">
        <i data-lucide="monitor-off" style="width:48px; height:48px; color:var(--text-muted); margin-bottom:var(--space-6);"></i>
        <h2 style="font-size:var(--text-h4); color:var(--text-secondary); margin-bottom:var(--space-6); text-transform:uppercase;">NO ACTIVE CAMPAIGN SELECTED.</h2>
        <button class="btn btn-primary" onclick="window.appRouter.navigate('campaign')">START NEW CAMPAIGN</button>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = `
    <div class="animate-fade-up" style="max-width:960px; margin:0 auto;">
      <header class="page-header">
        <div>
          <span class="badge" style="margin-bottom:var(--space-4);">CINEMATIC QUEUE ENGINE</span>
          <h1 class="page-title">REAL-TIME DELIVERY MONITOR</h1>
          <p style="font-size: var(--text-large); color: var(--text-secondary); text-transform: uppercase;">
            TRACKING GMAIL API SENDING PROGRESS WITH RANDOM JITTER DELAY AND AUTO-RETRIES.
          </p>
        </div>
        <div style="display:flex; gap:var(--space-4);">
          <button class="btn btn-secondary" id="btn-pause-campaign">
            <i data-lucide="pause" style="width:20px; height:20px;"></i> PAUSE QUEUE
          </button>
          <button class="btn btn-danger" id="btn-cancel-campaign">
            <i data-lucide="square" style="width:20px; height:20px; fill:currentColor;"></i> STOP QUEUE
          </button>
        </div>
      </header>

      <!-- Main Circular Progress Card -->
      <div class="premium-card" style="padding:var(--space-12) var(--space-8); margin-bottom:var(--space-12); text-align:center;">
        <div style="display:flex; justify-content:center; align-items:center; margin-bottom:var(--space-8);">
          <!-- SVG Circular Ring Indicator -->
          <div class="progress-ring-container">
            <svg class="progress-ring-svg" viewBox="0 0 120 120">
              <circle class="progress-ring-circle-bg" cx="60" cy="60" r="50" fill="transparent" />
              <circle class="progress-ring-circle-fill" id="prog-circle-fill" cx="60" cy="60" r="50" fill="transparent" stroke-dasharray="314.15" stroke-dashoffset="314.15" />
            </svg>
            <div class="progress-ring-text" id="prog-percent-text">0%</div>
          </div>
        </div>

        <div style="margin-bottom:var(--space-12);">
          <span class="badge badge-info" id="prog-status-badge">RUNNING</span>
          <p style="font-size:var(--text-body); color:var(--text-secondary); margin-top:var(--space-4); text-transform:uppercase; letter-spacing:0.05em;" id="prog-current-recipient-ticker">PREPARING EMAIL QUEUE...</p>
        </div>

        <!-- Metric Grid Boxes -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:var(--space-4);">
          <div style="background:var(--bg-app); border:1px solid var(--border-strong); padding:var(--space-6);">
            <div style="font-family:var(--font-heading); color:var(--accent-base); font-size:var(--text-h3); line-height:1; margin-bottom:var(--space-2);" id="prog-sent">0</div>
            <div style="font-size:var(--text-caption); color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em;">SENT</div>
          </div>

          <div style="background:var(--bg-app); border:1px solid var(--border-strong); padding:var(--space-6);">
            <div style="font-family:var(--font-heading); color:var(--accent-teal); font-size:var(--text-h3); line-height:1; margin-bottom:var(--space-2);" id="prog-remaining">0</div>
            <div style="font-size:var(--text-caption); color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em;">REMAINING</div>
          </div>

          <div style="background:var(--bg-app); border:1px solid var(--border-strong); padding:var(--space-6);">
            <div style="font-family:var(--font-heading); color:var(--color-error); font-size:var(--text-h3); line-height:1; margin-bottom:var(--space-2);" id="prog-failed">0</div>
            <div style="font-size:var(--text-caption); color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em;">FAILED</div>
          </div>

          <div style="background:var(--bg-app); border:1px solid var(--border-strong); padding:var(--space-6);">
            <div style="font-family:var(--font-heading); color:var(--text-primary); font-size:var(--text-h3); line-height:1; margin-bottom:var(--space-2);" id="prog-speed">0</div>
            <div style="font-size:var(--text-caption); color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em;">SPEED (EPM)</div>
          </div>

          <div style="background:var(--bg-app); border:1px solid var(--border-strong); padding:var(--space-6);">
            <div style="font-family:var(--font-heading); color:var(--text-primary); font-size:var(--text-h3); line-height:1; margin-bottom:var(--space-2);" id="prog-eta">0s</div>
            <div style="font-size:var(--text-caption); color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em;">EST. REMAINING</div>
          </div>

          <div style="background:var(--bg-app); border:1px solid var(--border-strong); padding:var(--space-6);">
            <div style="font-family:var(--font-heading); color:var(--text-primary); font-size:var(--text-h3); line-height:1; margin-bottom:var(--space-2);" id="prog-elapsed">0s</div>
            <div style="font-size:var(--text-caption); color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em;">ELAPSED TIME</div>
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:var(--space-4);">
        <button class="btn btn-secondary" onclick="window.appRouter.navigate('history')" style="padding:0 24px;">
          <i data-lucide="list" style="width:20px; height:20px;"></i> VIEW IN HISTORY
        </button>
        <a id="btn-export-csv-link" href="/api/v1/reports/campaign/${campaignId}/csv" class="btn btn-secondary" target="_blank" style="padding:0 24px;">
          <i data-lucide="download" style="width:20px; height:20px;"></i> EXPORT CSV REPORT
        </a>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  const pauseBtn = document.getElementById('btn-pause-campaign');
  const cancelBtn = document.getElementById('btn-cancel-campaign');
  const circleFill = document.getElementById('prog-circle-fill');

  let isPaused = false;

  pauseBtn.addEventListener('click', async () => {
    try {
      if (!isPaused) {
        await window.api.post(`/send/pause/${campaignId}`);
        pauseBtn.innerHTML = '<i data-lucide="play" style="width:20px; height:20px;"></i> RESUME QUEUE';
        if (window.lucide) window.lucide.createIcons();
        window.toast.info('CAMPAIGN QUEUE PAUSED.');
        isPaused = true;
      } else {
        await window.api.post(`/send/resume/${campaignId}`);
        pauseBtn.innerHTML = '<i data-lucide="pause" style="width:20px; height:20px;"></i> PAUSE QUEUE';
        if (window.lucide) window.lucide.createIcons();
        window.toast.success('CAMPAIGN QUEUE RESUMED.');
        isPaused = false;
      }
    } catch (e) {
      console.error(e);
    }
  });

  cancelBtn.addEventListener('click', async () => {
    const confirm = await window.modal.confirm({
      title: 'CANCEL SENDING QUEUE?',
      message: 'ARE YOU SURE YOU WANT TO STOP SENDING REMAINING EMAILS FOR THIS CAMPAIGN?',
      confirmText: 'STOP CAMPAIGN',
      type: 'danger'
    });

    if (confirm) {
      await window.api.post(`/send/cancel/${campaignId}`);
      window.toast.warning('CAMPAIGN QUEUE CANCELLED.');
      if (progressPollInterval) clearInterval(progressPollInterval);
      window.appRouter.navigate('history');
    }
  });

  const fetchProgress = async () => {
    try {
      const data = await window.api.get(`/send/progress/${campaignId}`);
      if (data.status === 'success') {
        const p = data.progress;
        document.getElementById('prog-status-badge').innerText = p.status.toUpperCase();
        document.getElementById('prog-percent-text').innerText = `${p.percentComplete}%`;
        
        const circumference = 314.15;
        const offset = circumference - (p.percentComplete / 100) * circumference;
        if (circleFill) circleFill.style.strokeDashoffset = offset;

        document.getElementById('prog-sent').innerText = p.sent;
        document.getElementById('prog-remaining').innerText = p.remaining;
        document.getElementById('prog-failed').innerText = p.failed;
        document.getElementById('prog-speed').innerText = p.speedEpm;
        document.getElementById('prog-eta').innerText = window.utils.formatTimeRemaining(p.estimatedSecRemaining);
        document.getElementById('prog-elapsed').innerText = window.utils.formatTimeRemaining(p.elapsedTimeSec);

        const ticker = document.getElementById('prog-current-recipient-ticker');
        if (ticker) {
          ticker.innerText = p.remaining > 0 ? `SENDING VIA GMAIL API WITH RANDOM JITTER DELAY...` : `ALL OUTREACH EMAILS DELIVERED SUCCESSFULLY.`;
        }

        if (p.status === 'completed') {
          window.toast.success('CAMPAIGN COMPLETED SUCCESSFULLY.');
          if (progressPollInterval) clearInterval(progressPollInterval);
        }
      }
    } catch (e) {
      console.error('Progress polling error:', e);
    }
  };

  fetchProgress();
  if (progressPollInterval) clearInterval(progressPollInterval);
  progressPollInterval = setInterval(fetchProgress, 2000);
}

window.renderProgressView = renderProgressView;
