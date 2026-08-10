// Lamborghini SaaS Landing View
function renderLandingView() {
  const container = document.getElementById('view-landing');
  if (!container) return;

  container.innerHTML = `
    <!-- Top Marketing Navbar -->
    <nav class="landing-nav" style="position: fixed; top: 0; left: 0; right: 0; height: 80px; display: flex; align-items: center; justify-content: space-between; background: transparent; z-index: 1000; padding: 0 var(--space-10);">
      
      <!-- Left side empty to balance right side -->
      <div style="flex: 1;"></div>

      <!-- Center Logo -->
      <div style="flex: 1; display: flex; justify-content: center; align-items: center; gap: var(--space-2);">
        <i data-lucide="mail" style="width:28px; height:28px; color:var(--text-primary);"></i>
        <span style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase;">
          HR Mailer
        </span>
      </div>
      
      <!-- Right side actions -->
      <div style="flex: 1; display: flex; justify-content: flex-end; align-items: center; gap: var(--space-4);">
        <a href="#login" class="btn btn-secondary" style="height: 40px; padding: 0 16px;">LOG IN</a>
      </div>
    </nav>

    <!-- Main Hero Section -->
    <div class="landing-hero" style="height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #000000; text-align: center; position: relative;">
      
      <div class="animate-fade-up stagger-1" style="z-index: 10;">
        <h1 class="hero-title" style="font-family: var(--font-heading); font-weight: 400; text-transform: uppercase; margin-bottom: var(--space-6); color: var(--text-primary);">
          HIGH-CONVERTING OUTREACH
        </h1>
        
        <p style="font-size: var(--text-large); color: var(--text-secondary); margin-bottom: var(--space-12); max-width: 600px; margin-inline: auto; text-transform: uppercase; letter-spacing: 0.05em;">
          Power your recruitment engine with automated jitter and guaranteed inbox placement.
        </p>

        <div style="display:flex; justify-content:center; gap:var(--space-6); flex-wrap:wrap;">
          <a href="#login" class="btn btn-primary btn-lg" style="text-decoration: none;">
            START CAMPAIGN
          </a>
        </div>
      </div>

      <!-- Bottom Progress Bar simulation (Lambo vibe) -->
      <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: rgba(255,255,255,0.2);">
        <div style="height: 100%; width: 33%; background: #FFFFFF;"></div>
      </div>
    </div>

    <!-- Features Section -->
    <div id="features" style="background: #000000; padding: 120px var(--space-10);">
      <div class="animate-fade-up stagger-2" style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 0;">
        
        <!-- Feature 1 -->
        <div class="premium-card interactive-card" style="border-right: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle);">
          <i data-lucide="shield-check" style="width:32px; height:32px; color:var(--text-primary); margin-bottom: var(--space-6);"></i>
          <h3 style="font-size: var(--text-h5); margin-bottom: var(--space-4);">ENTERPRISE SECURITY</h3>
          <p style="color: var(--text-muted); font-size:var(--text-body);">Direct integration with Google OAuth 2.0. No SMTP passwords required. Your data is encrypted at rest.</p>
        </div>

        <!-- Feature 2 -->
        <div class="premium-card interactive-card" style="border-bottom: 1px solid var(--border-subtle);">
          <i data-lucide="activity" style="width:32px; height:32px; color:var(--text-primary); margin-bottom: var(--space-6);"></i>
          <h3 style="font-size: var(--text-h5); margin-bottom: var(--space-4);">AUTOMATED JITTER</h3>
          <p style="color: var(--text-muted); font-size:var(--text-body);">Smart algorithmic delays between emails mimic human sending behavior to guarantee primary inbox placement.</p>
        </div>

        <!-- Feature 3 -->
        <div class="premium-card interactive-card" style="border-right: 1px solid var(--border-subtle);">
          <i data-lucide="pie-chart" style="width:32px; height:32px; color:var(--text-primary); margin-bottom: var(--space-6);"></i>
          <h3 style="font-size: var(--text-h5); margin-bottom: var(--space-4);">REAL-TIME ANALYTICS</h3>
          <p style="color: var(--text-muted); font-size:var(--text-body);">Monitor campaign progress, delivery rates, and failed bounces live. Export comprehensive CSV reports.</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer style="width: 100%; padding: var(--space-12) var(--space-10); background: var(--bg-surface);">
      <div style="max-width: 1200px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: space-between; gap: var(--space-8);">
        <div>
          <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-4);">
            <i data-lucide="mail" style="width:24px; height:24px; color:var(--text-primary);"></i>
            <span style="font-weight: 400; font-family:var(--font-heading); text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-primary);">HR MAILER</span>
          </div>
          <p style="color: var(--text-muted); font-size: var(--text-caption); text-transform: uppercase;">Designed for high-performance recruitment.</p>
        </div>
        <div style="display: flex; gap: var(--space-16);">
          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            <span style="font-weight: 600; font-size: var(--text-caption); color: var(--text-secondary); text-transform: uppercase;">Product</span>
            <a href="#" style="color: var(--text-muted); text-decoration: none; font-size: var(--text-caption); text-transform: uppercase;">Features</a>
            <a href="#" style="color: var(--text-muted); text-decoration: none; font-size: var(--text-caption); text-transform: uppercase;">Pricing</a>
          </div>
          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            <span style="font-weight: 600; font-size: var(--text-caption); color: var(--text-secondary); text-transform: uppercase;">Legal</span>
            <a href="#" style="color: var(--text-muted); text-decoration: none; font-size: var(--text-caption); text-transform: uppercase;">Privacy</a>
            <a href="#" style="color: var(--text-muted); text-decoration: none; font-size: var(--text-caption); text-transform: uppercase;">Terms</a>
          </div>
        </div>
      </div>
      <div style="max-width: 1200px; margin: 0 auto; margin-top: var(--space-12); padding-top: var(--space-8); border-top: 1px solid var(--border-strong); text-align: center; color: var(--text-disabled); font-size: var(--text-micro); text-transform: uppercase; letter-spacing: 0.225px;">
        &copy; ${new Date().getFullYear()} HR MAILER. ALL RIGHTS RESERVED.
      </div>
    </footer>
  `;

  // We don't need inline CSS for .hero-title because it's driven by tokens.css h1 clamp()
  let style = document.getElementById('landing-style');
  if (style) {
    style.remove();
  }

  if (window.lucide) window.lucide.createIcons();
}

window.renderLandingView = renderLandingView;
