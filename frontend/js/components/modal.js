// Dynamic Modal Dialog Manager
class ModalManager {
  confirm({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'primary' }) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = `modal-overlay active`;

      const btnClass = type === 'danger' ? 'btn-danger' : 'btn-primary';

      overlay.innerHTML = `
        <div class="modal-card animate-fade-in">
          <h3 style="font-size:1.25rem; font-weight:700; margin-bottom:0.75rem;">${title}</h3>
          <p style="color:var(--text-secondary); margin-bottom:1.5rem; font-size:0.95rem;">${message}</p>
          <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
            <button class="btn btn-secondary" id="modal-cancel-btn">${cancelText}</button>
            <button class="btn ${btnClass}" id="modal-confirm-btn">${confirmText}</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      const cancelBtn = overlay.querySelector('#modal-cancel-btn');
      const confirmBtn = overlay.querySelector('#modal-confirm-btn');

      const cleanup = (value) => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 200);
        resolve(value);
      };

      cancelBtn.addEventListener('click', () => cleanup(false));
      confirmBtn.addEventListener('click', () => cleanup(true));
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cleanup(false);
      });
    });
  }
}

window.modal = new ModalManager();
