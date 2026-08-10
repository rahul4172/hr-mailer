// Lamborghini Dashboard View
let deliveryChartInstance = null;

async function renderDashboardView() {
  const container = document.getElementById('view-dashboard');
  if (!container) return;

  const state = window.store.getState();
  const user = state.user || { name: 'Rahul', email: 'user@gmail.com' };

  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'GOOD MORNING' : hour < 18 ? 'GOOD AFTERNOON' : 'GOOD EVENING';
  const userNameFirst = user.name ? user.name.split(' ')[0].toUpperCase() : 'RAHUL';

  container.innerHTML = `
    <div class="animate-fade-up">
      
      <!-- Lamborghini Page Header -->
      <header class="page-header">
        <div>
          <h1 class="page-title">${greetingTime}, ${window.utils.escapeHtml(userNameFirst)}</h1>
          <p style="font-size: var(--text-large); color: var(--text-secondary); text-transform: uppercase;">
            YOUR HIGH-CONVERTING OUTREACH ENGINE IS READY TO LAUNCH.
          </p>
        </div>
      </header>

      <!-- Statistics Grid & Chart -->
      <div style="display:flex; gap:var(--space-6); flex-wrap:wrap; margin-bottom:var(--space-12);">
        
        <!-- Metrics Grid -->
        <div style="flex:1; min-width:320px; display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:var(--space-4);" id="dashboard-stats-grid">
          ${window.skeleton.renderCards(4)}
        </div>

        <!-- Chart.js Delivery Analytics -->
        <div class="premium-card" style="flex:2; min-width:280px; height: 260px; display:flex; flex-direction:column;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-6);">
            <h3 style="font-size:var(--text-card-title); font-family:var(--font-heading); display:flex; align-items:center; gap:var(--space-2); text-transform:uppercase;">
              <i data-lucide="bar-chart-2" style="width:24px; height:24px; color:var(--text-muted);"></i> DELIVERY VOLUME
            </h3>
            <span class="badge">LAST 7 DAYS</span>
          </div>
          <div style="flex:1; position:relative; width:100%;">
            <canvas id="delivery-chart"></canvas>
          </div>
        </div>

      </div>

      <!-- Quick Action Cards Grid -->
      <h3 style="font-family:var(--font-heading); font-size:var(--text-h5); margin-bottom:var(--space-6); color:var(--text-primary); text-transform:uppercase;">QUICK ACTIONS</h3>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:var(--space-4); margin-bottom:var(--space-12);">
        
        <div class="premium-card interactive-card" onclick="window.appRouter.navigate('campaign')" style="cursor:pointer; display:flex; align-items:flex-start; gap:var(--space-4);">
          <i data-lucide="zap" style="width:32px; height:32px; color:var(--accent-base);"></i>
          <div>
            <h4 style="font-family:var(--font-heading); font-size:var(--text-card-title); margin-bottom:var(--space-2); text-transform:uppercase;">LAUNCH CAMPAIGN</h4>
            <p style="font-size:var(--text-caption); color:var(--text-secondary); text-transform:uppercase;">Start a new personalized outreach campaign.</p>
          </div>
        </div>

        <div class="premium-card interactive-card" onclick="window.commandPalette.open()" style="cursor:pointer; display:flex; align-items:flex-start; gap:var(--space-4);">
          <i data-lucide="command" style="width:32px; height:32px; color:var(--text-primary);"></i>
          <div>
            <h4 style="font-family:var(--font-heading); font-size:var(--text-card-title); margin-bottom:var(--space-2); text-transform:uppercase;">COMMAND PALETTE</h4>
            <p style="font-size:var(--text-caption); color:var(--text-secondary); text-transform:uppercase;">Press ⌘ K to search actions and campaigns.</p>
          </div>
        </div>

        <div class="premium-card interactive-card" onclick="window.appRouter.navigate('reports')" style="cursor:pointer; display:flex; align-items:flex-start; gap:var(--space-4);">
          <i data-lucide="pie-chart" style="width:32px; height:32px; color:var(--text-primary);"></i>
          <div>
            <h4 style="font-family:var(--font-heading); font-size:var(--text-card-title); margin-bottom:var(--space-2); text-transform:uppercase;">VIEW REPORTS</h4>
            <p style="font-size:var(--text-caption); color:var(--text-secondary); text-transform:uppercase;">Export raw logs and analyze delivery data.</p>
          </div>
        </div>

      </div>

      <!-- Recent Campaign Timeline Section -->
      <div class="premium-card">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--space-8); flex-wrap:wrap; gap:var(--space-4);">
          <h3 style="font-family:var(--font-heading); font-size:var(--text-h5); text-transform:uppercase;">EXECUTION TIMELINE</h3>
          <button class="btn btn-secondary btn-sm" onclick="window.appRouter.navigate('history')">
            VIEW ALL
          </button>
        </div>

        <div id="dashboard-recent-timeline" class="stagger-1 animate-fade-up">
          ${window.skeleton.renderCards(3)}
        </div>
      </div>
    </div>
  `;

  // Fetch live stats & render Chart.js
  try {
    const data = await window.api.get('/campaigns/stats/summary');
    if (data.status === 'success') {
      const stats = data.stats;
      const statsGrid = document.getElementById('dashboard-stats-grid');
      
      if (statsGrid) {
        statsGrid.innerHTML = `
          <div class="premium-card" style="display:flex; flex-direction:column; justify-content:center;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-4);">
              <span style="font-size:var(--text-micro); color:var(--text-muted); text-transform:uppercase; letter-spacing:0.225px;">CAMPAIGNS</span>
              <i data-lucide="folder" style="width:16px; height:16px; color:var(--text-muted);"></i>
            </div>
            <div style="font-family:var(--font-heading); font-size:var(--text-h3); color:var(--text-primary); line-height:1;">${stats.totalCampaigns}</div>
          </div>

          <div class="premium-card" style="display:flex; flex-direction:column; justify-content:center;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-4);">
              <span style="font-size:var(--text-micro); color:var(--text-muted); text-transform:uppercase; letter-spacing:0.225px;">SENT</span>
              <i data-lucide="mail-check" style="width:16px; height:16px; color:var(--accent-base);"></i>
            </div>
            <div style="font-family:var(--font-heading); font-size:var(--text-h3); color:var(--accent-base); line-height:1;">${stats.totalSent}</div>
          </div>

          <div class="premium-card" style="display:flex; flex-direction:column; justify-content:center;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-4);">
              <span style="font-size:var(--text-micro); color:var(--text-muted); text-transform:uppercase; letter-spacing:0.225px;">FAILED</span>
              <i data-lucide="alert-circle" style="width:16px; height:16px; color:var(--text-muted);"></i>
            </div>
            <div style="font-family:var(--font-heading); font-size:var(--text-h3); color:var(--text-primary); line-height:1;">${stats.totalFailed}</div>
          </div>

          <div class="premium-card" style="display:flex; flex-direction:column; justify-content:center;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-4);">
              <span style="font-size:var(--text-micro); color:var(--text-muted); text-transform:uppercase; letter-spacing:0.225px;">DELIVERY RATE</span>
              <i data-lucide="trending-up" style="width:16px; height:16px; color:var(--text-muted);"></i>
            </div>
            <div style="font-family:var(--font-heading); font-size:var(--text-h3); color:var(--text-primary); line-height:1;">${stats.deliveryRate}%</div>
          </div>
        `;
      }

      // Initialize Chart.js
      const ctx = document.getElementById('delivery-chart');
      if (ctx && window.Chart) {
        if (deliveryChartInstance) {
          deliveryChartInstance.destroy();
        }
        
        const gridColor = '#202020';
        const textColor = '#7D7D7D';
        
        const mockData = [0, 0, 0, 0, Math.floor(stats.totalSent * 0.2), Math.floor(stats.totalSent * 0.3), Math.floor(stats.totalSent * 0.5)];
        const labels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

        deliveryChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'DELIVERED',
              data: mockData,
              borderColor: '#FFC000',
              backgroundColor: 'rgba(255, 192, 0, 0.1)',
              borderWidth: 2,
              pointBackgroundColor: '#FFC000',
              pointBorderColor: '#181818',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              fill: true,
              tension: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#000000',
                titleColor: '#FFFFFF',
                bodyColor: '#7D7D7D',
                borderColor: '#494949',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 0,
                titleFont: { size: 14, family: 'Roboto' },
                bodyFont: { size: 12, family: 'Roboto' }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: gridColor, drawBorder: false },
                ticks: { color: textColor, font: { family: 'Roboto', size: 10 } }
              },
              x: {
                grid: { display: false, drawBorder: false },
                ticks: { color: textColor, font: { family: 'Roboto', size: 10 } }
              }
            }
          }
        });
      }

      const timelineContainer = document.getElementById('dashboard-recent-timeline');
      if (timelineContainer) {
        if (!data.recentCampaigns || data.recentCampaigns.length === 0) {
          timelineContainer.innerHTML = `
            <div class="empty-state">
              <i data-lucide="inbox"></i>
              <h3>NO ACTIVITY YET</h3>
              <p>YOUR TIMELINE WILL POPULATE ONCE YOU LAUNCH YOUR FIRST CAMPAIGN.</p>
              <button class="btn btn-primary" onclick="window.appRouter.navigate('campaign')">
                NEW CAMPAIGN
              </button>
            </div>
          `;
        } else {
          timelineContainer.innerHTML = data.recentCampaigns.map(c => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:var(--space-6) 0; border-bottom:1px solid var(--bg-surface-active);">
              <div style="display:flex; align-items:center; gap:var(--space-4);">
                <div style="width:48px; height:48px; background:var(--bg-base); display:flex; align-items:center; justify-content:center; font-size:var(--text-card-title); color:var(--text-primary); border:1px solid var(--border-strong);">
                  ${c.title.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 style="font-size:var(--text-large); color:var(--text-primary); text-transform:uppercase;">${window.utils.escapeHtml(c.title)}</h4>
                  <p style="font-size:var(--text-caption); color:var(--text-secondary); margin-top:4px; text-transform:uppercase;">${window.utils.formatDate(c.created_at)}</p>
                </div>
              </div>

              <div style="display:flex; align-items:center; gap:var(--space-6);">
                <div style="text-align:right; display:flex; flex-direction:column; align-items:flex-end;">
                  <span class="badge ${c.status === 'completed' ? 'badge-success' : c.status === 'running' ? 'badge-info' : 'badge-warning'}">
                    ${c.status}
                  </span>
                  <span style="font-size:var(--text-micro); color:var(--text-muted); margin-top:8px; letter-spacing:0.225px;">${c.sent_count}/${c.valid_count} SENT</span>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="window.appRouter.navigate('progress', { campaignId: '${c.id}' })">
                  VIEW
                </button>
              </div>
            </div>
          `).join('');
          
          const lastItem = timelineContainer.lastElementChild;
          if (lastItem) lastItem.style.borderBottom = 'none';
        }
      }
    }
  } catch (err) {
    console.error('Failed to load dashboard stats:', err);
  }
}

window.renderDashboardView = renderDashboardView;
