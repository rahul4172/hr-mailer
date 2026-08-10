// Lamborghini Campaign Setup View
let emailParserTimeout = null;

function renderCampaignView() {
  const container = document.getElementById('view-campaign');
  if (!container) return;

  const draftState = window.store.getState().draftCampaign;
  
  container.innerHTML = `
    <div class="animate-fade-up">
      <header class="page-header">
        <div>
          <span class="badge" style="margin-bottom:var(--space-4);">STEP 1 OF 4</span>
          <h1 class="page-title">CAMPAIGN SETUP</h1>
          <p style="font-size: var(--text-large); color: var(--text-secondary); text-transform: uppercase;">
            NAME YOUR CAMPAIGN AND PASTE TARGET EMAILS. DUPLICATES REMOVED AUTOMATICALLY.
          </p>
        </div>
      </header>

      <div class="premium-card" style="margin-bottom:var(--space-12);">
        <div style="margin-bottom:var(--space-8);">
          <label class="form-label" for="campaign-title">CAMPAIGN TITLE (INTERNAL)</label>
          <input type="text" id="campaign-title" class="glass-input" placeholder="E.G. Q3 SOFTWARE ENGINEER APPLICATIONS" value="${draftState.title || ''}">
        </div>
        
        <div style="margin-bottom:var(--space-4); display:flex; flex-wrap:wrap; gap:8px; justify-content:space-between; align-items:flex-end;">
          <label class="form-label" style="margin-bottom:0;">RAW EMAIL LIST</label>
          <div style="font-size:var(--text-caption); color:var(--text-muted); font-weight:600; text-transform:uppercase; letter-spacing:0.1em;" id="email-stats">0 VALID | 0 DUPLICATES</div>
        </div>
        
        <!-- Email Input Dropzone -->
        <div style="position:relative; margin-bottom:var(--space-8);">
          <textarea id="raw-email-input" class="glass-input" style="height:200px; font-family:var(--font-mono); font-size:var(--text-body);" placeholder="PASTE EMAILS HERE... (E.G. HR@COMPANY.COM)"></textarea>
          
          <div id="email-chips-container" style="display:flex; flex-wrap:wrap; gap:var(--space-2); margin-top:var(--space-6); max-height:200px; overflow-y:auto;">
            <!-- Interactive Chips rendered here -->
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; padding-top:var(--space-6); border-top:1px solid var(--border-subtle);">
          <button class="btn btn-primary" id="btn-next-composer">
            CONTINUE TO COMPOSER <i data-lucide="arrow-right" style="width:20px; height:20px;"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  const inputEl = document.getElementById('raw-email-input');
  
  if (draftState.rawEmails) {
    inputEl.value = draftState.rawEmails;
    parseEmailsLive(draftState.rawEmails);
  }

  inputEl.addEventListener('input', (e) => {
    clearTimeout(emailParserTimeout);
    emailParserTimeout = setTimeout(() => {
      parseEmailsLive(e.target.value);
    }, 400); // Debounce parser
  });

  document.getElementById('btn-next-composer').addEventListener('click', () => {
    const title = document.getElementById('campaign-title').value.trim();
    const rawEmails = document.getElementById('raw-email-input').value.trim();
    
    if (!title) {
      window.toast.error('PLEASE PROVIDE A CAMPAIGN TITLE.');
      return;
    }

    if (!rawEmails || window.store.getState().draftCampaign.parsedData?.valid === 0) {
      window.toast.error('PLEASE PROVIDE AT LEAST ONE VALID EMAIL ADDRESS.');
      return;
    }

    // Save to store
    window.store.setState({
      draftCampaign: {
        ...window.store.getState().draftCampaign,
        title,
        rawEmails
      }
    });

    window.appRouter.navigate('composer');
  });
}

// Live parsing and cascading chip rendering
async function parseEmailsLive(rawText) {
  if (!rawText.trim()) {
    document.getElementById('email-chips-container').innerHTML = '';
    document.getElementById('email-stats').innerText = '0 VALID | 0 DUPLICATES';
    return;
  }

  try {
    const res = await window.api.post('/campaigns/parse-emails', { text: rawText });
    if (res.status === 'success') {
      const data = res.data;
      
      window.store.setState({
        draftCampaign: {
          ...window.store.getState().draftCampaign,
          parsedData: data
        }
      });

      document.getElementById('email-stats').innerHTML = `
        <span style="color:var(--color-success);">${data.valid} VALID</span> | 
        <span>${data.duplicates} DUPLICATES</span> | 
        <span style="color:var(--color-error);">${data.invalid} INVALID</span>
      `;

      renderInteractiveChips(data.recipients);
    }
  } catch (err) {
    console.error('Email parse error:', err);
  }
}

function renderInteractiveChips(emailList) {
  const container = document.getElementById('email-chips-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  const fragment = document.createDocumentFragment();
  
  emailList.forEach((item, index) => {
    const el = document.createElement('div');
    
    let chipClass = 'chip';
    if (item.status === 'valid') chipClass += ' chip-valid';
    if (item.status === 'invalid') chipClass += ' chip-invalid';
    
    const delay = Math.min(index * 15, 600); 
    
    el.className = `${chipClass} animate-fade-up`;
    el.style.animationDelay = `${delay}ms`;
    el.style.opacity = '0';
    el.style.animationFillMode = 'forwards';
    
    el.innerHTML = `
      <span>${window.utils.escapeHtml(item.email)}</span>
      <button class="chip-remove-btn" data-email="${window.utils.escapeHtml(item.email)}">
        <i data-lucide="x" style="width:16px; height:16px; pointer-events:none;"></i>
      </button>
    `;
    
    fragment.appendChild(el);
  });
  
  container.appendChild(fragment);
  if (window.lucide) window.lucide.createIcons();

  // Add remove handlers
  document.querySelectorAll('.chip-remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const emailToRemove = e.currentTarget.getAttribute('data-email');
      const inputEl = document.getElementById('raw-email-input');
      
      const regex = new RegExp(emailToRemove + '[,\\\\s]*', 'g');
      inputEl.value = inputEl.value.replace(regex, '').trim();
      
      parseEmailsLive(inputEl.value);
    });
  });
}

window.renderCampaignView = renderCampaignView;
