// Native details supports tap and keyboard activation even without JavaScript.
// Add hover discovery, Escape dismissal, and dismissal outside the popover.
document.querySelectorAll('[data-artwork-details]').forEach((details) => {
  const summary = details.querySelector('summary');
  const panel = details.querySelector('.artwork-popover');
  let leaveTimer;

  const close = (restoreFocus = false) => {
    window.clearTimeout(leaveTimer);
    details.open = false;
    if (restoreFocus) summary.focus();
  };

  details.addEventListener('toggle', () => {
    if (!details.open) return;
    const rect = summary.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom;
    const above = below < 300 && rect.top > below;
    details.dataset.placement = above ? 'above' : 'below';
    panel.style.maxHeight = `${Math.max(180, Math.min(640, (above ? rect.top : below) - 24))}px`;
  });

  details.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover)').matches) return;
    window.clearTimeout(leaveTimer);
    details.open = true;
  });

  details.addEventListener('pointerleave', (event) => {
    if (event.pointerType !== 'mouse') return;
    leaveTimer = window.setTimeout(() => {
      if (!details.contains(document.activeElement)) close();
    }, 220);
  });

  details.addEventListener('focusout', () => {
    window.setTimeout(() => {
      if (!details.contains(document.activeElement) && !details.matches(':hover')) close();
    }, 0);
  });

  details.querySelector('[data-artwork-close]').addEventListener('click', () => close(true));
  document.addEventListener('pointerdown', (event) => {
    if (!details.contains(event.target)) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && details.open) {
      event.preventDefault();
      close(details.contains(document.activeElement));
    }
  });
});
