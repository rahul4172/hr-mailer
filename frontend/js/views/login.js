// Lamborghini Auth/Login View
function renderLoginView() {
  const container = document.getElementById('view-login');
  if (!container) return;

  container.innerHTML = `
    <!-- Centered Modal/Panel -->
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-app); position: absolute; inset: 0; z-index: 500;">
      
      <div class="premium-card animate-fade-up" style="width: 100%; max-width: 440px; padding: var(--space-12); border: 1px solid var(--border-strong);">
        
        <div style="text-align: center; margin-bottom: var(--space-8);">
          <div style="width: 56px; height: 56px; background: var(--bg-base); border: 1px solid var(--border-strong); display: flex; align-items: center; justify-content: center; margin: 0 auto var(--space-6);">
            <i data-lucide="mail" style="width: 28px; height: 28px; color: var(--text-primary);"></i>
          </div>
          <h2 style="font-family: var(--font-heading); font-size: var(--text-h3); margin-bottom: var(--space-2); text-transform: uppercase;">HR MAILER</h2>
          <p style="color: var(--text-secondary); font-size: var(--text-body); text-transform: uppercase; letter-spacing: 0.05em;">SECURE WORKSPACE LOGIN</p>
        </div>

        <button id="btn-google-login" class="btn btn-secondary" style="width: 100%; height: 56px; font-size: var(--text-large); justify-content: center;">
          <svg style="width: 20px; height: 20px; margin-right: 12px;" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          CONTINUE WITH GOOGLE
        </button>

        <div style="margin-top: var(--space-8); text-align: center; font-size: var(--text-caption); color: var(--text-muted); text-transform: uppercase;">
          Protected by Google OAuth 2.0
        </div>
      </div>
      
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const loginBtn = document.getElementById('btn-google-login');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      loginBtn.disabled = true;
      loginBtn.innerHTML = '<div class="spinner" style="width:20px; height:20px; border:2px solid var(--text-primary); border-top-color:transparent; border-radius:50%; animation:spin 1s linear infinite;"></div>';
      
      // Directly navigate to the backend auth route
      window.location.href = '/auth/google';
    });
  }
}

window.renderLoginView = renderLoginView;
