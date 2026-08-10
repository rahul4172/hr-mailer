// Lamborghini Analytics & Reports View
async function renderReportsView() {
  const container = document.getElementById('view-reports');
  if (!container) return;

  container.innerHTML = `
    <div class="animate-fade-up">
      <header class="page-header">
        <div>
          <h1 class="page-title">GLOBAL ANALYTICS</h1>
          <p style="font-size: var(--text-large); color: var(--text-secondary); text-transform: uppercase;">
            ACCOUNT-LEVEL EMAIL DELIVERY METRICS AND PERFORMANCE DATA.
          </p>
        </div>
        <div>
          <a href="/api/v1/reports/global/csv" class="btn btn-secondary" target="_blank" style="padding: 0 24px;">
            <i data-lucide="download" style="width:20px; height:20px;"></i> EXPORT GLOBAL CSV
          </a>
        </div>
      </header>

      <!-- Overview Cards -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:var(--space-6); margin-bottom:var(--space-12);" id="reports-stats-grid">
        ${window.skeleton.renderCards(3)}
      </div>

      <!-- Detailed Breakdown Section -->
      <div class="premium-card" style="padding:var(--space-8);">
        <h3 style="font-family:var(--font-heading); font-size:var(--text-h5); margin-bottom:var(--space-8); display:flex; align-items:center; gap:var(--space-4); text-transform:uppercase;">
          <i data-lucide="pie-chart" style="width:24px; height:24px; color:var(--text-muted);"></i> RECENT CAMPAIGN PERFORMANCE
        </h3>
        <div id="reports-breakdown-list" style="display:flex; flex-direction:column;">
           ${window.skeleton.renderCards(2)}
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  try {
    const data = await window.api.get('/campaigns/stats/summary');
    if (data.status === 'success') {
      const stats = data.stats;
      
      document.getElementById('reports-stats-grid').innerHTML = `
        <div class="premium-card" style="padding:var(--space-8); display:flex; flex-direction:column; justify-content:center; text-align:center;">
          <div style="font-size:var(--text-caption); color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:var(--space-4);">TOTAL VOLUME SENT</div>
          <div style="font-family:var(--font-heading); font-size:var(--text-h2); color:var(--text-primary); margin-bottom:var(--space-2); line-height:1;">${stats.totalSent}</div>
          <div style="font-size:var(--text-micro); color:var(--text-secondary); text-transform:uppercase;">EMAILS DELIVERED VIA GMAIL</div>
        </div>

        <div class="premium-card" style="padding:var(--space-8); display:flex; flex-direction:column; justify-content:center; text-align:center;">
          <div style="font-size:var(--text-caption); color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:var(--space-4);">GLOBAL DELIVERY RATE</div>
          <div style="font-family:var(--font-heading); font-size:var(--text-h2); color:var(--color-success); margin-bottom:var(--space-2); line-height:1;">${stats.deliveryRate}%</div>
          <div style="font-size:var(--text-micro); color:var(--text-secondary); text-transform:uppercase;">INBOX PLACEMENT ESTIMATE</div>
        </div>

        <div class="premium-card" style="padding:var(--space-8); display:flex; flex-direction:column; justify-content:center; text-align:center;">
          <div style="font-size:var(--text-caption); color:var(--text-muted); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:var(--space-4);">TRANSIENT ERRORS</div>
          <div style="font-family:var(--font-heading); font-size:var(--text-h2); color:var(--color-error); margin-bottom:var(--space-2); line-height:1;">${stats.totalFailed}</div>
          <div style="font-size:var(--text-micro); color:var(--text-secondary); text-transform:uppercase;">BOUNCES OR API LIMITS</div>
        </div>
      `;

      const listContainer = document.getElementById('reports-breakdown-list');
      if (data.recentCampaigns.length === 0) {
        listContainer.innerHTML = `
          <div class="empty-state" style="border:none; background:transparent; padding:var(--space-8) 0;">
            <p style="color:var(--text-muted); font-size:var(--text-body); text-transform:uppercase;">NO CAMPAIGN DATA AVAILABLE.</p>
          </div>
        `;
      } else {
        listContainer.innerHTML = data.recentCampaigns.map((c, index) => {
          const isLast = index === data.recentCampaigns.length - 1;
          const borderStyle = isLast ? 'none' : '1px solid var(--border-strong)';
          return `
          <div style="padding:var(--space-6) 0; border-bottom:${borderStyle}; display:flex; flex-wrap:wrap; gap:var(--space-4); justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:var(--space-6); min-width:200px;">
              <div style="width:48px; height:48px; background:var(--bg-base); border:1px solid var(--border-strong); display:flex; align-items:center; justify-content:center; font-family:var(--font-heading); font-size:var(--text-card-title); color:var(--text-primary);">
                ${c.title.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style="font-family:var(--font-heading); font-size:var(--text-large); color:var(--text-primary); margin-bottom:4px; text-transform:uppercase;">${window.utils.escapeHtml(c.title)}</div>
                <div style="font-size:var(--text-caption); color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.1em;">${window.utils.formatDate(c.created_at)}</div>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-family:var(--font-heading); color:var(--text-primary); font-size:var(--text-card-title); text-transform:uppercase;">${c.sent_count} SENT</div>
              <div style="font-family:var(--font-heading); font-size:var(--text-body); color:var(--color-error); margin-top:4px; text-transform:uppercase;">${c.failed_count} FAILED</div>
            </div>
          </div>
        `}).join('');
      }
    }
  } catch (e) {
    console.error(e);
  }
}

window.renderReportsView = renderReportsView;
