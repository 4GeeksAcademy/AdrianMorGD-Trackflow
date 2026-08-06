if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

const resetPageScroll = () => {
  window.scrollTo(0, 0);
};

window.addEventListener('load', resetPageScroll);
window.addEventListener('pageshow', resetPageScroll);

const initMobileMenuDrawer = () => {
  const menuToggleButton = document.querySelector('[data-menu-toggle]');
  const mobileMenuPanel = document.querySelector('[data-menu-panel]');
  const mobileMenuOverlay = document.querySelector('[data-menu-overlay]');
  const mobileMenuCloseButton = document.querySelector('[data-menu-close]');

  if (!menuToggleButton || !mobileMenuPanel) {
    return;
  }

  const closeMenu = () => {
    menuToggleButton.setAttribute('aria-expanded', 'false');
    mobileMenuPanel.classList.add('translate-x-full');

    if (mobileMenuOverlay) {
      mobileMenuOverlay.classList.add('opacity-0', 'pointer-events-none');
    }
  };

  const openMenu = () => {
    menuToggleButton.setAttribute('aria-expanded', 'true');
    mobileMenuPanel.classList.remove('translate-x-full');

    if (mobileMenuOverlay) {
      mobileMenuOverlay.classList.remove('opacity-0', 'pointer-events-none');
    }
  };

  menuToggleButton.addEventListener('click', () => {
    const isExpanded = menuToggleButton.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMenu();
      return;
    }

    openMenu();
  });

  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', closeMenu);
  }

  if (mobileMenuCloseButton) {
    mobileMenuCloseButton.addEventListener('click', closeMenu);
  }

  mobileMenuPanel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMobileMenuDrawer, { once: true });
} else {
  initMobileMenuDrawer();
}
