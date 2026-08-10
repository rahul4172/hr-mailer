// Lamborghini Attachments View
function renderAttachmentsView() {
  const container = document.getElementById('view-attachments');
  if (!container) return;

  const draftState = window.store.getState().draftCampaign;

  container.innerHTML = `
    <div class="animate-fade-up">
      <header class="page-header">
        <div>
          <span class="badge" style="margin-bottom:var(--space-4);">STEP 3 OF 4</span>
          <h1 class="page-title">ATTACHMENTS</h1>
          <p style="font-size: var(--text-large); color: var(--text-secondary); text-transform: uppercase;">
            UPLOAD YOUR RESUME, PORTFOLIO, OR COVER LETTER (PDF, DOCX) TO INCLUDE IN THE EMAIL.
          </p>
        </div>
      </header>

      <div class="premium-card" style="padding:var(--space-8); margin-bottom:var(--space-12);">
        
        <!-- File Dropzone -->
        <div class="interactive-card" id="attachment-dropzone" style="border: 1px dashed var(--border-strong); text-align:center; padding:var(--space-12) var(--space-6); margin-bottom:var(--space-8); cursor:pointer; transition:all var(--spring-swift); background: var(--bg-surface-active);">
          <div style="font-size:2rem; margin-bottom:var(--space-4); color:var(--text-muted);">
            <i data-lucide="upload-cloud" style="width:48px; height:48px;"></i>
          </div>
          <h4 style="font-weight:400; font-family:var(--font-heading); font-size:var(--text-card-title); margin-bottom:var(--space-2); text-transform:uppercase;">DRAG & DROP FILES HERE</h4>
          <p style="font-size:var(--text-caption); color:var(--text-secondary); text-transform:uppercase;">OR CLICK TO BROWSE (MAX 5MB PER FILE)</p>
          <input type="file" id="attachment-file-input" multiple accept=".pdf,.doc,.docx" style="display:none;" />
        </div>

        <div id="attachment-list" style="margin-bottom:var(--space-8); display:flex; flex-direction:column; gap:var(--space-4);">
          <!-- Attached files render here -->
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:var(--space-4); padding-top:var(--space-6); border-top:1px solid var(--border-subtle);">
          <button class="btn btn-secondary" onclick="window.appRouter.navigate('composer')" style="padding:0 32px;">
            <i data-lucide="arrow-left" style="width:20px; height:20px;"></i> BACK
          </button>
          <button class="btn btn-primary" id="btn-launch-campaign" style="padding:0 32px;">
            <i data-lucide="send" style="width:20px; height:20px;"></i> LAUNCH CAMPAIGN
          </button>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const dropzone = document.getElementById('attachment-dropzone');
  const fileInput = document.getElementById('attachment-file-input');

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--accent-base)';
    dropzone.style.background = 'rgba(255, 192, 0, 0.05)';
  });

  dropzone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--border-strong)';
    dropzone.style.background = 'var(--bg-surface-active)';
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'var(--border-strong)';
    dropzone.style.background = 'var(--bg-surface-active)';
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
  });

  const handleFiles = (files) => {
    const currentFiles = window.store.getState().draftCampaign.attachments || [];
    const newFiles = Array.from(files);
    
    // Basic validation
    const validFiles = newFiles.filter(f => {
      if (f.size > 5 * 1024 * 1024) {
        window.toast.error(`FILE ${f.name.toUpperCase()} IS TOO LARGE (MAX 5MB)`);
        return false;
      }
      return true;
    });

    window.store.setState({
      draftCampaign: {
        ...window.store.getState().draftCampaign,
        attachments: [...currentFiles, ...validFiles]
      }
    });

    renderAttachmentList();
  };

  const renderAttachmentList = () => {
    const files = window.store.getState().draftCampaign.attachments || [];
    const listEl = document.getElementById('attachment-list');
    
    if (files.length === 0) {
      listEl.innerHTML = '';
      return;
    }

    listEl.innerHTML = files.map((f, i) => `
      <div style="background:var(--bg-base); padding:var(--space-4) var(--space-6); display:flex; justify-content:space-between; align-items:center; border:1px solid var(--border-strong);">
        <div style="display:flex; align-items:center; gap:var(--space-4);">
          <i data-lucide="file-text" style="width:24px; height:24px; color:var(--accent-base);"></i>
          <div>
            <div style="font-family:var(--font-heading); font-size:var(--text-body); text-transform:uppercase;">${window.utils.escapeHtml(f.name)}</div>
            <div style="font-size:var(--text-caption); color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.1em;">${(f.size / 1024 / 1024).toFixed(2)} MB</div>
          </div>
        </div>
        <button class="btn btn-secondary" style="width:36px; height:36px; padding:0; display:flex; align-items:center; justify-content:center;" onclick="removeAttachment(${i})">
          <i data-lucide="x" style="width:16px; height:16px;"></i>
        </button>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  };

  window.removeAttachment = (index) => {
    const files = window.store.getState().draftCampaign.attachments || [];
    files.splice(index, 1);
    window.store.setState({
      draftCampaign: {
        ...window.store.getState().draftCampaign,
        attachments: files
      }
    });
    renderAttachmentList();
  };

  // Initial render if user navigated back
  renderAttachmentList();

  // Launch Campaign Action
  document.getElementById('btn-launch-campaign').addEventListener('click', async () => {
    const draft = window.store.getState().draftCampaign;
    
    if (!draft.title || !draft.subject || !draft.templateBody || !draft.parsedData || draft.parsedData.recipients.length === 0) {
      window.toast.error('CAMPAIGN DATA IS INCOMPLETE. PLEASE REVIEW PREVIOUS STEPS.');
      return;
    }

    // Confirm Launch
    const confirm = await window.modal.confirm({
      title: 'LAUNCH CAMPAIGN?',
      message: `YOU ARE ABOUT TO SEND <strong>${draft.parsedData.valid}</strong> EMAILS.<br><br>ARE YOU SURE YOU WANT TO START THE DELIVERY QUEUE?`,
      confirmText: 'LAUNCH NOW'
    });

    if (!confirm) return;

    try {
      window.toast.info('INITIATING CAMPAIGN QUEUE...');
      const btn = document.getElementById('btn-launch-campaign');
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner" style="width:16px; height:16px; border:2px solid var(--bg-app); border-top-color:transparent; border-radius:50%; animation:spin 1s linear infinite; margin-right:8px;"></span> STARTING...`;

      // Step 1: Create Campaign
      const createRes = await window.api.post('/campaigns', {
        title: draft.title,
        subject: draft.subject,
        templateBody: draft.templateBody,
        signature: draft.signature || '',
        rawEmails: draft.rawEmails,
        minDelaySec: 10,
        maxDelaySec: 25,
        maxRetries: 3
      });

      if (createRes.status === 'error') {
        throw new Error(createRes.message || 'FAILED TO CREATE CAMPAIGN');
      }

      const campaignId = createRes.campaignId;

      // Step 2: Upload Attachments (if any)
      if (draft.attachments && draft.attachments.length > 0) {
        for (const file of draft.attachments) {
          const formData = new FormData();
          formData.append('campaignId', campaignId);
          formData.append('file', file);
          await window.api.post('/upload', formData, true);
        }
      }

      // Step 3: Start the Queue
      const startRes = await window.api.post(`/send/start/${campaignId}`);
      
      if (startRes.status === 'success') {
        window.toast.success('CAMPAIGN LAUNCHED SUCCESSFULLY.');
        
        // Clear draft state
        window.store.setState({
          activeCampaignId: campaignId,
          draftCampaign: {}
        });

        window.appRouter.navigate('progress');
      } else {
        throw new Error(startRes.message || 'FAILED TO START QUEUE');
      }
    } catch (e) {
      console.error(e);
      window.toast.error(e.message || 'FAILED TO LAUNCH CAMPAIGN.');
      document.getElementById('btn-launch-campaign').disabled = false;
      document.getElementById('btn-launch-campaign').innerHTML = '<i data-lucide="send" style="width:20px; height:20px; margin-right:4px;"></i> LAUNCH CAMPAIGN';
      if (window.lucide) window.lucide.createIcons();
    }
  });
}

window.renderAttachmentsView = renderAttachmentsView;
