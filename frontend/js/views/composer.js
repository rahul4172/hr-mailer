// Lamborghini Email Composer View
function renderComposerView() {
  const container = document.getElementById('view-composer');
  if (!container) return;

  const draftState = window.store.getState().draftCampaign;

  container.innerHTML = `
    <div class="animate-fade-up">
      <header class="page-header">
        <div>
          <span class="badge" style="margin-bottom:var(--space-4);">STEP 2 OF 4</span>
          <h1 class="page-title">EMAIL COMPOSER</h1>
          <p style="font-size: var(--text-large); color: var(--text-secondary); text-transform: uppercase;">
            TYPE "/" OR CLICK VARIABLES BELOW TO PERSONALIZE YOUR TEMPLATE.
          </p>
        </div>
        <div style="display:flex; gap:var(--space-4);">
          <button class="btn btn-secondary" onclick="window.previewEmailModal()">
            <i data-lucide="eye" style="width:20px; height:20px;"></i> LIVE PREVIEW
          </button>
        </div>
      </header>

      <div class="premium-card" style="padding:var(--space-8); margin-bottom:var(--space-12);">
        <div style="margin-bottom:var(--space-8);">
          <label class="form-label" for="email-subject" style="display:block; margin-bottom:var(--space-4);">EMAIL SUBJECT LINE</label>
          <input type="text" id="email-subject" class="glass-input" placeholder="E.G. EXPLORING OPPORTUNITIES AT {{COMPANY}}" value="${draftState.subject || ''}">
        </div>

        <div style="margin-bottom:var(--space-8);">
          <label class="form-label" style="display:block; margin-bottom:var(--space-4);">DYNAMIC VARIABLES</label>
          <div style="display:flex; gap:var(--space-4); flex-wrap:wrap;">
            <button class="chip chip-valid" onclick="insertVariable('{{company}}')"><i data-lucide="building" style="width:16px; height:16px;"></i> {{COMPANY}}</button>
            <button class="chip chip-valid" onclick="insertVariable('{{name}}')"><i data-lucide="user" style="width:16px; height:16px;"></i> {{NAME}}</button>
            <button class="chip chip-valid" onclick="insertVariable('{{email}}')"><i data-lucide="mail" style="width:16px; height:16px;"></i> {{EMAIL}}</button>
            <button class="chip chip-valid" onclick="insertVariable('{{greeting}}')"><i data-lucide="message-circle" style="width:16px; height:16px;"></i> {{GREETING}}</button>
          </div>
        </div>
        
        <div style="position:relative; margin-bottom:var(--space-8);">
          <label class="form-label" for="email-body" style="display:block; margin-bottom:var(--space-4);">EMAIL BODY</label>
          <textarea id="email-body" class="glass-input" style="height:320px; resize:vertical; font-size:var(--text-body); line-height:1.6;" placeholder="TYPE / FOR SLASH COMMANDS OR START TYPING YOUR EMAIL HERE...">${draftState.templateBody || ''}</textarea>
        </div>

        <div style="margin-bottom:var(--space-12);">
          <label class="form-label" for="email-signature" style="display:block; margin-bottom:var(--space-4);">EMAIL SIGNATURE (OPTIONAL)</label>
          <textarea id="email-signature" class="glass-input" style="height:120px; resize:vertical; font-size:var(--text-body);" placeholder="BEST REGARDS,\nRAHUL">${draftState.signature || ''}</textarea>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:var(--space-4); padding-top:var(--space-6); border-top:1px solid var(--border-subtle);">
          <button class="btn btn-secondary" onclick="window.appRouter.navigate('campaign')" style="padding:0 32px;">
            <i data-lucide="arrow-left" style="width:20px; height:20px;"></i> BACK
          </button>
          <button class="btn btn-primary" id="btn-next-attachments" style="padding:0 32px;">
            ATTACH RESUME <i data-lucide="arrow-right" style="width:20px; height:20px;"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  const saveDraft = () => {
    window.store.setState({
      draftCampaign: {
        ...window.store.getState().draftCampaign,
        subject: document.getElementById('email-subject').value,
        templateBody: document.getElementById('email-body').value,
        signature: document.getElementById('email-signature').value
      }
    });
  };

  document.getElementById('email-subject').addEventListener('input', saveDraft);
  document.getElementById('email-body').addEventListener('input', saveDraft);
  document.getElementById('email-signature').addEventListener('input', saveDraft);

  const bodyInput = document.getElementById('email-body');

  bodyInput.addEventListener('keyup', (e) => {
    if (e.key === '/') {
      window.toast.info('SLASH COMMAND PALETTE ACTIVATED.');
      window.commandPalette.open();
    }
  });

  window.insertVariable = (variable) => {
    const el = document.getElementById('email-body');
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    
    el.value = text.substring(0, start) + variable + text.substring(end);
    el.focus();
    el.setSelectionRange(start + variable.length, start + variable.length);
    saveDraft();
  };

  document.getElementById('btn-next-attachments').addEventListener('click', () => {
    saveDraft();
    const state = window.store.getState().draftCampaign;
    if (!state.subject || !state.templateBody) {
      window.toast.error('SUBJECT AND EMAIL BODY ARE REQUIRED.');
      return;
    }
    window.appRouter.navigate('attachments');
  });

  if (window.lucide) window.lucide.createIcons();
}

window.previewEmailModal = () => {
  const state = window.store.getState().draftCampaign;
  
  if (!state.subject || !state.templateBody) {
    window.toast.warning('ENTER SUBJECT AND BODY TO GENERATE A PREVIEW.');
    return;
  }

  let previewBody = state.templateBody
    .replace(/{{company}}/gi, '<strong>APPLE INC.</strong>')
    .replace(/{{name}}/gi, '<strong>TIM COOK</strong>')
    .replace(/{{email}}/gi, 'TIM@APPLE.COM')
    .replace(/{{greeting}}/gi, 'HI TIM');

  if (state.signature) {
    previewBody += `\n\n${state.signature}`;
  }

  previewBody = previewBody.replace(/\n/g, '<br>');

  const subject = state.subject.replace(/{{company}}/gi, 'APPLE INC.');

  window.modal.confirm({
    title: 'LIVE EMAIL PREVIEW',
    message: `
      <div style="background:var(--bg-surface-active); padding:var(--space-6); border:1px solid var(--border-strong); margin-bottom:var(--space-6);">
        <div style="margin-bottom:var(--space-2);"><strong style="color:var(--text-muted); font-size:var(--text-caption); text-transform:uppercase;">TO:</strong> <span style="font-size:var(--text-body);">TIM@APPLE.COM</span></div>
        <div><strong style="color:var(--text-muted); font-size:var(--text-caption); text-transform:uppercase;">SUBJECT:</strong> <span style="font-size:var(--text-body); font-weight:600;">${window.utils.escapeHtml(subject)}</span></div>
      </div>
      <div style="background:var(--bg-app); padding:var(--space-8); border:1px solid var(--border-strong); min-height:240px; font-size:var(--text-body); line-height:1.6;">
        ${previewBody}
      </div>
    `,
    confirmText: 'LOOKS GOOD',
    cancelText: 'EDIT DRAFT'
  });
};

window.renderComposerView = renderComposerView;
