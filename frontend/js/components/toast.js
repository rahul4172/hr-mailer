// Sonner-Style Stacked Notification System
class ToastManager {
  constructor() {
    this.container = document.getElementById('toast-container');
    this.toasts = [];
    this.maxToasts = 3;
    this.toastIdCounter = 0;
  }

  show(message, type = 'info', duration = 4000) {
    if (!this.container) return;

    const id = `toast-${++this.toastIdCounter}`;
    
    // Define Icon and Color based on type
    let iconName = 'info';
    let iconColor = 'var(--text-primary)';
    
    switch(type) {
      case 'success': 
        iconName = 'check-circle-2'; 
        iconColor = 'var(--accent-base)'; 
        break;
      case 'error': 
        iconName = 'x-circle'; 
        iconColor = 'hsl(var(--error-500))'; 
        break;
      case 'warning': 
        iconName = 'alert-triangle'; 
        iconColor = 'hsl(var(--warning-500))'; 
        break;
      case 'info':
      default:
        iconName = 'info';
        iconColor = 'var(--text-primary)';
        break;
    }

    const toastEl = document.createElement('div');
    toastEl.className = 'sonner-toast';
    toastEl.id = id;
    
    toastEl.innerHTML = `
      <div class="sonner-toast-icon" style="color: ${iconColor};">
        <i data-lucide="${iconName}" style="width:20px; height:20px;"></i>
      </div>
      <div class="sonner-toast-content">
        <p class="sonner-toast-message">${window.utils.escapeHtml(message)}</p>
      </div>
      <button class="sonner-toast-close" onclick="window.toast.dismiss('${id}')">
        <i data-lucide="x" style="width:14px; height:14px;"></i>
      </button>
    `;

    this.container.appendChild(toastEl);
    if (window.lucide) window.lucide.createIcons();

    const toastData = { id, el: toastEl, timeout: null };
    
    // Add to state and trigger render physics
    this.toasts.unshift(toastData);
    this.renderStack();

    // Auto dismiss
    if (duration > 0) {
      toastData.timeout = setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  renderStack() {
    // Keep only maxToasts visible
    if (this.toasts.length > this.maxToasts) {
      const toRemove = this.toasts.pop();
      this.dismiss(toRemove.id, true);
    }

    // Apply stacking physics based on index
    this.toasts.forEach((t, index) => {
      const el = t.el;
      
      // Calculate transform physics
      const scale = 1 - (index * 0.05);
      const yOffset = index * -12; // stack upwards
      const opacity = index === 0 ? 1 : index === 1 ? 0.7 : 0.4;
      
      el.style.transform = `translateY(${yOffset}px) scale(${scale})`;
      el.style.opacity = opacity;
      el.style.zIndex = 9999 - index;
      
      if (index > 0) {
        el.style.pointerEvents = 'none'; // Only top toast is interactive
      } else {
        el.style.pointerEvents = 'auto';
      }
    });
  }

  dismiss(id, immediate = false) {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index === -1) return;

    const t = this.toasts[index];
    if (t.timeout) clearTimeout(t.timeout);

    this.toasts.splice(index, 1);
    
    if (immediate) {
      t.el.remove();
    } else {
      t.el.style.opacity = '0';
      t.el.style.transform = 'translateY(100%) scale(0.9)';
      t.el.style.pointerEvents = 'none';
      
      setTimeout(() => {
        if (t.el.parentNode) t.el.parentNode.removeChild(t.el);
      }, 300); // Wait for transition
    }

    this.renderStack();
  }

  success(msg) { this.show(msg, 'success'); }
  error(msg) { this.show(msg, 'error'); }
  warning(msg) { this.show(msg, 'warning'); }
  info(msg) { this.show(msg, 'info'); }
}

window.toast = new ToastManager();
