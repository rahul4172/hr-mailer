// Skeleton Screen Loader Component
class SkeletonLoader {
  renderCards(count = 3) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="glass-card skeleton" style="height: 120px; margin-bottom: 1rem;"></div>
      `;
    }
    return html;
  }

  renderTableRows(count = 5) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <tr>
          <td colspan="5"><div class="skeleton" style="height: 24px; width: 100%;"></div></td>
        </tr>
      `;
    }
    return html;
  }
}

window.skeleton = new SkeletonLoader();
