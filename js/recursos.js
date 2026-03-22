document.addEventListener('DOMContentLoaded', function () {
  initResourceTabs();
  initRecursosModal();
});

function initResourceTabs() {
  const tabs = document.querySelectorAll('.resource-tab');
  const contents = document.querySelectorAll('.resource-content');
  if (!tabs.length) return;

  const switchTab = (targetId) => {
    tabs.forEach((t) => t.classList.remove('active'));
    contents.forEach((c) => c.classList.remove('active'));

    const activeTab = document.querySelector(`.resource-tab[data-target="${targetId}"]`);
    const activeContent = document.getElementById(targetId);
    activeTab?.classList.add('active');
    activeContent?.classList.add('active');
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', function () {
      switchTab(this.getAttribute('data-target'));
    });
  });

  const firstActive = document.querySelector('.resource-tab.active');
  if (!firstActive && tabs.length) {
    switchTab(tabs[0].getAttribute('data-target'));
  }
}

function initRecursosModal() {
  const modal = document.getElementById('modal');
  const modalOverlay = document.getElementById('modal-overlay');
  if (!modal || !modalOverlay) return;

  const closeBtn = modal.querySelector('.close-btn');
  const modalTitle = modal.querySelector('.modal-title');
  const modalDescription = modal.querySelector('.modal-description');
  const modalImage = modal.querySelector('.modal-image');
  const viewBtn = modal.querySelector('.view-btn');
  const downloadBtn = modal.querySelector('.download-btn');

  const openModal = (title, description, imageSrc, pdfLink) => {
    modalTitle.innerHTML = `<i class="fas fa-file-alt"></i> ${title}`;
    modalDescription.textContent = description;
    modalImage.src = imageSrc;
    modalImage.alt = title;

    const hasPdf = pdfLink && pdfLink !== '#';
    if (viewBtn) {
      viewBtn.href = hasPdf ? pdfLink : '#';
      viewBtn.style.display = hasPdf ? 'inline-flex' : 'none';
    }
    if (downloadBtn) {
      downloadBtn.href = hasPdf ? pdfLink : '#';
      downloadBtn.download = `${title.replace(/\s+/g, '_')}.pdf`;
      downloadBtn.style.display = hasPdf ? 'inline-flex' : 'none';
    }

    modalOverlay.style.display = 'block';
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.style.display = 'none';
    modalOverlay.style.display = 'none';
    document.body.style.overflow = '';
  };

  const getAttr = (el, name) => el.getAttribute(name) || '#';

  document.querySelectorAll('.resource-item').forEach((item) => {
    item.addEventListener('click', function (e) {
      if (this.tagName === 'A') e.preventDefault();
      openModal(
        getAttr(this, 'data-title') || 'Sin título',
        getAttr(this, 'data-description') || 'Sin descripción.',
        getAttr(this, 'data-image') || '../images/default-document.png',
        getAttr(this, 'data-pdf')
      );
    });
  });

  closeBtn?.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}
