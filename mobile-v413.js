/* Character Bookshelf v4.1.3: presentation-only mobile navigation.
   Existing action listeners and file access logic remain unchanged. */
(() => {
  const initialize = () => {
    const bar = document.querySelector('.topbar');
    const actions = bar?.querySelector('.topactions');
    const brand = bar?.querySelector('.brand');
    if (!bar || !actions || !brand || document.getElementById('mobileMenuToggle')) return;
    const toggle = document.createElement('button');
    toggle.id = 'mobileMenuToggle';
    toggle.className = 'mobileMenuToggle';
    toggle.type = 'button';
    toggle.textContent = '☰ Menu';
    toggle.setAttribute('aria-label', 'Open application actions');
    toggle.setAttribute('aria-controls', 'mobileApplicationActions');
    toggle.setAttribute('aria-expanded', 'false');
    actions.id = 'mobileApplicationActions';
    bar.insertBefore(toggle, actions);
    bar.classList.add('mobileMenuReady');
    const close = () => {
      actions.classList.remove('mobileExpanded');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open application actions');
      toggle.textContent = '☰ Menu';
    };
    toggle.addEventListener('click', () => {
      if (actions.classList.contains('mobileExpanded')) { close(); return; }
      actions.classList.add('mobileExpanded');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close application actions');
      toggle.textContent = '× Close';
    });
    actions.addEventListener('click', e => {
      if (e.target.closest('button')) close();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && actions.classList.contains('mobileExpanded')) close();
    });
    // A later orientation change must not leave the compact menu expanded.
    const screen = window.matchMedia('(max-width: 750px)');
    if (screen.addEventListener) screen.addEventListener('change', close);
    // Only close on main-document navigation, not when a dialog needs to stay open.
    document.querySelector('.workspace')?.addEventListener('click', e => {
      if (screen.matches && actions.classList.contains('mobileExpanded') && !e.target.closest('dialog')) close();
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, {once:true});
  else initialize();
})();
