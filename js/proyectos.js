document.addEventListener('DOMContentLoaded', function () {
  initProyectosModal();
});

function initProyectosModal() {
  const modal = document.getElementById('modal');
  const modalOverlay = document.getElementById('modal-overlay');
  if (!modal || !modalOverlay) return;

  const closeBtn = modal.querySelector('.close-btn');
  const modalTitle = modal.querySelector('.modal-title');
  const modalDescription = modal.querySelector('.modal-description');
  const modalImage = modal.querySelector('.modal-image');
  const repoBtn = modal.querySelector('.repo-btn');
  const demoBtn = modal.querySelector('.demo-btn');

  const openModal = (title, description, imageSrc, repoLink, demoLink) => {
    modalTitle.innerHTML = `<i class="fas fa-file-alt"></i> ${title}`;
    modalDescription.textContent = description;
    modalImage.src = imageSrc;
    modalImage.alt = title;

    if (repoBtn) {
      repoBtn.href = repoLink;
      repoBtn.style.display = repoLink !== '#' ? 'inline-flex' : 'none';
    }
    if (demoBtn) {
      demoBtn.href = demoLink;
      demoBtn.style.display = demoLink !== '#' ? 'inline-flex' : 'none';
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

  document.querySelectorAll('.gallery-item.project-link').forEach((item) => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      openModal(
        getAttr(this, 'data-title') || 'Sin título',
        getAttr(this, 'data-description') || 'Sin descripción.',
        getAttr(this, 'data-image'),
        getAttr(this, 'data-repo'),
        getAttr(this, 'data-demo')
      );
    });
  });

  closeBtn?.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}
