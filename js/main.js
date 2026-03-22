document.addEventListener('DOMContentLoaded', function () {
  initIntersectionObserver();
  initActiveSidebarLink();
  initResponsiveMenu();
});

function initIntersectionObserver() {
  const targets = document.querySelectorAll('.sec, .project-card, .gallery-item, .about-card, .skill-category, .sub-section, .contact-card');
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  targets.forEach((el) => observer.observe(el));
}

function initActiveSidebarLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.sidebar-nav a');

  navLinks.forEach((link) => {
    const linkPath = link.getAttribute('href').split('/').pop();
    if (linkPath === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function initResponsiveMenu() {
  const menuBtn = document.querySelector('.menu-btn');
  const menuToggle = document.getElementById('click');
  const sidebar = document.querySelector('.sidebar-nav');

  if (!sidebar) return;

  let overlay = document.querySelector('.menu-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);
  }

  const toggleMenu = (isOpen) => {
    sidebar.classList.toggle('active', isOpen);
    overlay.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    if (menuToggle) menuToggle.checked = isOpen;
  };

  if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu(!sidebar.classList.contains('active'));
    });
  }

  overlay.addEventListener('click', () => toggleMenu(false));

  document.addEventListener('click', (e) => {
    if (
      sidebar.classList.contains('active') &&
      !sidebar.contains(e.target) &&
      (!menuBtn || !menuBtn.contains(e.target))
    ) {
      toggleMenu(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) toggleMenu(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
      toggleMenu(false);
    }
  });
}
