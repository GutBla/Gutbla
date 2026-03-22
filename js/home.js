document.addEventListener('DOMContentLoaded', function () {
  initPlanetarySystem();
  initResourceOverlays();
  loadLatestProjectsFromJSON();
});

const IS_SUBPAGE = window.location.pathname.includes('/pages/');
const BASE       = IS_SUBPAGE ? '../' : '';

function adjustPath(relativePath) {
  if (!relativePath) return '';
  if (relativePath.startsWith('http') || relativePath.startsWith('//') || relativePath.startsWith('/')) {
    return relativePath;
  }
  const cleaned = relativePath.replace(/^\.\.\//, '');
  return BASE + cleaned;
}

function initPlanetarySystem() {
  const profileImage = document.querySelector('.profile-image');
  if (!profileImage) return;
  profileImage.addEventListener('mouseenter', () => {
    profileImage.style.transition =
      'transform 0.42s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.42s ease, border-color 0.4s ease';
  });
}

function initResourceOverlays() {
  const gallery = document.querySelector('.resources-gallery');
  if (!gallery) return;
  const labelMap = [
    {
      keywords: ['documentacion', 'documentation', 'docs'],
      label: 'Documentación',
      icon:  'fas fa-file-alt'
    },
    {
      keywords: ['trucos', 'cheat', 'hoja', 'cheatsheet', 'sheet'],
      label: 'Hojas de Trucos',
      icon:  'fas fa-clipboard-list'
    },
    {
      keywords: ['tutorial', 'tutoriales', 'guide', 'curso'],
      label: 'Tutoriales',
      icon:  'fas fa-graduation-cap'
    },
    {
      keywords: ['herramienta', 'tool', 'recurso', 'resource'],
      label: 'Herramientas',
      icon:  'fas fa-tools'
    }
  ];
  function getResourceMeta(img) {
    const haystack = (img.src + ' ' + img.alt)
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    for (const entry of labelMap) {
      if (entry.keywords.some(kw => haystack.includes(kw))) {
        return { label: entry.label, icon: entry.icon };
      }
    }
    return { label: 'Ver Recurso', icon: 'fas fa-book-open' };
  }
  Array.from(gallery.querySelectorAll('img')).forEach(img => {
    const { label, icon } = getResourceMeta(img);
    const wrapper = document.createElement('div');
    wrapper.className = 'resource-wrapper';
    wrapper.setAttribute('aria-label', label);
    wrapper.setAttribute('role', 'button');
    wrapper.setAttribute('tabindex', '0');
    const overlay = document.createElement('div');
    overlay.className = 'resource-overlay';
    overlay.innerHTML = `
      <i class="${icon} resource-overlay-icon"></i>
      <span class="resource-overlay-label">${label}</span>`;
    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);
    wrapper.appendChild(overlay);
    wrapper.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        wrapper.click();
      }
    });
  });
}

async function loadLatestProjectsFromJSON() {
  const gallery = document.querySelector('.project-gallery');
  if (!gallery) return;
  try {
    const res      = await fetch('data/projects.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const projects = await res.json();
    const sorted   = [...projects].sort((a, b) => new Date(b.date) - new Date(a.date));
    const display  = sorted.slice(0, 5);
    const newest   = sorted[0];
    gallery.innerHTML = '';
    gallery.style.gridTemplateColumns = `repeat(${display.length}, 1fr)`;
    display.forEach((project, index) => {
      const imageSrc = adjustPath(project.image);
      if (index === 0) {
        const wrapper = document.createElement('div');
        wrapper.className = 'project-gallery-item';
        const img = document.createElement('img');
        img.src     = imageSrc;
        img.alt     = project.title;
        img.loading = 'lazy';
        const badge = document.createElement('span');
        badge.className   = 'latest-badge';
        badge.textContent = 'NUEVO';
        wrapper.appendChild(img);
        wrapper.appendChild(badge);
        gallery.appendChild(wrapper);
      } else {
        const img = document.createElement('img');
        img.src     = imageSrc;
        img.alt     = project.title;
        img.loading = 'lazy';
        gallery.appendChild(img);
      }
    });
    fillLatestCard(newest);
  } catch (err) {
    console.warn('home.js: no se pudo cargar data/projects.json —', err.message);
    fallbackProjectsGrayscale();
  }
}

function fillLatestCard(project) {
  if (!project) return;
  const card = document.querySelector('.latest-project-card');
  if (!card) return;
  const set = (sel, val, attr = 'textContent') => {
    const el = card.querySelector(sel);
    if (el) el[attr] = val;
  };
  set('.latest-project-title', project.title);
  set('.latest-project-desc',  project.description);
  const imgEl = card.querySelector('.latest-project-img');
  if (imgEl) {
    imgEl.src = adjustPath(project.image);
    imgEl.alt = project.title;
  }
  if (project.date) {
    const d = new Date(project.date);
    set('.latest-project-date',
      d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }));
  }
  const tagsEl = card.querySelector('.latest-project-tags');
  if (tagsEl && project.tags) {
    tagsEl.innerHTML = project.tags.map(t => `<span>${t}</span>`).join('');
  }
}

function fallbackProjectsGrayscale() {
  const gallery = document.querySelector('.project-gallery');
  if (!gallery) return;
  const imgs = Array.from(gallery.querySelectorAll('img'));
  if (imgs.length > 5) {
    imgs.slice(0, imgs.length - 5).forEach(img => { img.style.display = 'none'; });
  }
  const visible = imgs.filter(img => img.style.display !== 'none');
  if (visible.length > 0 && visible.length <= 5) {
    gallery.style.gridTemplateColumns = `repeat(${visible.length}, 1fr)`;
  }
}