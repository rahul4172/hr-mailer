// Lamborghini Campaign History View
async function renderHistoryView() {
  const container = document.getElementById('view-history');
  if (!container) return;

  container.innerHTML = `
    <div class="animate-fade-up">
      <header class="page-header">
        <div>
          <h1 class="page-title">CAMPAIGN TIMELINE</h1>
          <p style="font-size: var(--text-large); color: var(--text-secondary); text-transform: uppercase;">
            SEARCH, FILTER, EXPORT REPORTS, OR REVIEW DETAILS FOR PAST CAMPAIGNS.
          </p>
        </div>
        <div>
          <button class="btn btn-danger btn-sm" id="btn-bulk-delete" style="display:none; padding: 0 16px;">
            <i data-lucide="trash-2" style="width:16px; height:16px;"></i> DELETE SELECTED
          </button>
        </div>
      </header>

      <!-- Filter Bar Controls -->
      <div class="premium-card" style="padding:var(--space-4) var(--space-6); margin-bottom:var(--space-8); display:flex; gap:var(--space-4); flex-wrap:wrap; align-items:center; justify-content:space-between;">
        <div style="flex:1; min-width:240px; position:relative;">
          <i data-lucide="search" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); width:16px; height:16px; color:var(--text-muted);"></i>
          <input type="text" id="history-search-input" class="glass-input" style="padding-left:40px; height:40px; font-size:var(--text-body);" placeholder="SEARCH CAMPAIGN TITLE, EMAIL, OR COMPANY..." />
        </div>
        <div style="display:flex; gap:var(--space-2);">
          <button class="btn btn-secondary filter-btn active" data-status="all" style="height:40px; padding:0 16px;">ALL</button>
          <button class="btn btn-secondary filter-btn" data-status="running" style="height:40px; padding:0 16px;">RUNNING</button>
          <button class="btn btn-secondary filter-btn" data-status="completed" style="height:40px; padding:0 16px;">COMPLETED</button>
          <button class="btn btn-secondary filter-btn" data-status="paused" style="height:40px; padding:0 16px;">PAUSED</button>
        </div>
      </div>

      <!-- Timeline Container -->
      <div id="history-timeline-cards-list" style="display:flex; flex-direction:column; gap:var(--space-4);">
        ${window.skeleton.renderCards(4)}
      </div>
    </div>
  `;

  let currentStatus = 'all';
  let searchTimer = null;

  const loadHistory = async () => {
    const searchVal = document.getElementById('history-search-input')?.value || '';
    try {
      const data = await window.api.get(`/campaigns?status=${currentStatus}&search=${encodeURIComponent(searchVal)}`);
      if (data.status === 'success') {
        renderTimelineCards(data.campaigns);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderTimelineCards = (campaigns) => {
    const listContainer = document.getElementById('history-timeline-cards-list');
    if (!listContainer) return;

    if (campaigns.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state" style="border: 1px solid var(--border-strong);">
          <i data-lucide="inbox"></i>
          <h3>NO CAMPAIGNS FOUND</h3>
          <p>WE COULD NOT FIND ANY CAMPAIGNS MATCHING YOUR FILTERS.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    listContainer.innerHTML = campaigns.map((c, index) => {
      const delay = Math.min(index * 20, 200);
      return `
      <div class="premium-card animate-fade-up interactive-card" style="padding:var(--space-6); animation-delay:${delay}ms; opacity:0; animation-fill-mode:forwards;">
        
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:var(--space-4);">
          
          <div style="display:flex; align-items:center; gap:var(--space-4);">
            <input type="checkbox" class="campaign-checkbox" value="${c.id}" style="width:16px; height:16px; cursor:pointer;" />
            <div style="width:48px; height:48px; background:var(--bg-app); display:flex; align-items:center; justify-content:center; font-family:var(--font-heading); font-size:var(--text-card-title); color:var(--text-primary); border:1px solid var(--border-strong);">
              ${c.title.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 style="font-family:var(--font-heading); font-size:var(--text-card-title); color:var(--text-primary); margin-bottom:4px; text-transform:uppercase;">${window.utils.escapeHtml(c.title)}</h4>
              <p style="font-size:var(--text-caption); color:var(--text-secondary); text-transform:uppercase;">${window.utils.escapeHtml(c.subject)}</p>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:var(--space-8); flex-wrap:wrap;">
            <div style="text-align:right;">
              <div style="font-family:var(--font-heading); font-size:var(--text-body); color:var(--text-primary); text-transform:uppercase;">${c.sent_count} / ${c.valid_count} SENT</div>
              <div style="font-size:var(--text-micro); color:var(--text-muted); margin-top:4px; text-transform:uppercase; letter-spacing:0.1em;">${window.utils.formatDate(c.created_at)}</div>
            </div>
            
            <span class="badge ${c.status === 'completed' ? 'badge-success' : c.status === 'running' ? 'badge-info' : 'badge-warning'}">
              ${c.status}
            </span>
            
            <div style="display:flex; gap:var(--space-2);">
              <button class="btn btn-secondary" style="height:36px; padding:0 16px;" onclick="window.viewCampaignDetails('${c.id}')">
                DETAILS
              </button>
              <a href="/api/v1/reports/campaign/${c.id}/csv" class="btn btn-secondary" style="height:36px; width:36px; padding:0; display:flex; align-items:center; justify-content:center;" target="_blank" title="DOWNLOAD CSV">
                <i data-lucide="download" style="width:16px; height:16px;"></i>
              </a>
              <button class="btn btn-secondary" style="height:36px; width:36px; padding:0; display:flex; align-items:center; justify-content:center; color:var(--color-error);" onclick="window.deleteSingleCampaign('${c.id}')" title="DELETE">
                <i data-lucide="trash-2" style="width:16px; height:16px;"></i>
              </button>
            </div>
          </div>
          
        </div>
      </div>
    `}).join('');

    updateCheckboxListeners();
    if (window.lucide) window.lucide.createIcons();
  };

  const updateCheckboxListeners = () => {
    const checkboxes = document.querySelectorAll('.campaign-checkbox');
    const bulkBtn = document.getElementById('btn-bulk-delete');

    checkboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        const checked = document.querySelectorAll('.campaign-checkbox:checked');
        if (bulkBtn) bulkBtn.style.display = checked.length > 0 ? 'inline-flex' : 'none';
      });
    });
  };

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentStatus = btn.getAttribute('data-status');
      loadHistory();
    });
  });

  document.getElementById('history-search-input').addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadHistory, 300);
  });

  window.viewCampaignDetails = async (id) => {
    try {
      const data = await window.api.get(`/campaigns/${id}`);
      if (data.status === 'success') {
        const c = data.campaign;
        const emails = data.emails || [];

        const modalBody = `
          <div style="font-size:var(--text-body); text-transform:uppercase;">
            <div style="margin-bottom:var(--space-6); background:var(--bg-app); padding:var(--space-6); border:1px solid var(--border-strong);">
              <div style="margin-bottom:var(--space-2);"><strong style="color:var(--text-muted);">SUBJECT:</strong> ${window.utils.escapeHtml(c.subject)}</div>
              <div style="margin-bottom:var(--space-2);"><strong style="color:var(--text-muted);">STATUS:</strong> ${c.status}</div>
              <div><strong style="color:var(--text-muted);">RECIPIENTS:</strong> ${c.valid_count} &nbsp;&nbsp;|&nbsp;&nbsp; <strong style="color:var(--text-muted);">SENT:</strong> ${c.sent_count} &nbsp;&nbsp;|&nbsp;&nbsp; <strong style="color:var(--text-muted);">FAILED:</strong> ${c.failed_count}</div>
            </div>

            <h4 style="margin-bottom:var(--space-4); font-family:var(--font-heading); font-size:var(--text-card-title);">RECIPIENT STATUS LOG</h4>
            <div style="max-height:300px; overflow-y:auto; border:1px solid var(--border-strong); background:var(--bg-base);">
              <table style="width:100%; font-size:var(--text-caption); border-collapse:collapse; text-align:left;">
                <thead style="background:var(--bg-surface-active); position:sticky; top:0; z-index:1;">
                  <tr>
                    <th style="padding:12px; font-weight:400; font-family:var(--font-heading);">EMAIL</th>
                    <th style="padding:12px; font-weight:400; font-family:var(--font-heading);">COMPANY</th>
                    <th style="padding:12px; font-weight:400; font-family:var(--font-heading);">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  ${emails.map((e, idx) => `
                    <tr style="border-bottom:1px solid var(--border-strong); background:${idx % 2 === 0 ? 'transparent' : 'var(--bg-app)'};">
                      <td style="padding:12px; font-family:var(--font-mono);">${window.utils.escapeHtml(e.recipient_email)}</td>
                      <td style="padding:12px;">${window.utils.escapeHtml(e.company_name || '-')}</td>
                      <td style="padding:12px;"><span class="badge ${e.status === 'sent' ? 'badge-success' : 'badge-error'}">${e.status}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;

        window.modal.confirm({
          title: `CAMPAIGN DETAILS`,
          message: modalBody,
          confirmText: 'CLOSE',
          cancelText: 'EXPORT CSV'
        }).then(res => {
          if (!res) {
            window.open(`/api/v1/reports/campaign/${id}/csv`, '_blank');
          }
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  window.deleteSingleCampaign = async (id) => {
    const confirm = await window.modal.confirm({
      title: 'DELETE CAMPAIGN RECORD?',
      message: 'ARE YOU SURE YOU WANT TO DELETE THIS CAMPAIGN AND ALL ASSOCIATED LOGS?',
      confirmText: 'DELETE',
      type: 'danger'
    });

    if (confirm) {
      await window.api.delete(`/campaigns/${id}`);
      window.toast.info('CAMPAIGN DELETED.');
      loadHistory();
    }
  };

  loadHistory();
}

window.renderHistoryView = renderHistoryView;
