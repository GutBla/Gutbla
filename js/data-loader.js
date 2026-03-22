const DataLoader = (() => {
  const IS_SUBPAGE = window.location.pathname.includes("/pages/");
  const BASE = IS_SUBPAGE ? "../" : "";

  function adjustPath(relativePath) {
    if (!relativePath) return "";
    if (
      relativePath.startsWith("http") ||
      relativePath.startsWith("//") ||
      relativePath.startsWith("/")
    ) {
      return relativePath;
    }
    const cleaned = relativePath.replace(/^\.\.\//, "");
    return BASE + cleaned;
  }

  async function fetchJSON(relativePath) {
    const res = await fetch(BASE + relativePath);
    if (!res.ok)
      throw new Error(`No se pudo cargar ${relativePath} (${res.status})`);
    return res.json();
  }

  function buildProjectItem(project) {
    const el = document.createElement("div");
    el.className = "gallery-item project-link";
    el.dataset.title = project.title;
    el.dataset.description = project.description;
    el.dataset.image = adjustPath(project.image);
    el.dataset.repo = project.repo || "#";
    el.dataset.demo = project.demo || "#";
    el.innerHTML = `
      <div class="image-container">
        <img src="${adjustPath(project.image)}" alt="${project.title}" loading="lazy" />
      </div>`;
    return el;
  }

  function buildResourceItem(item) {
    const el = document.createElement("div");
    el.className = "gallery-item resource-item";
    el.dataset.title = item.title;
    el.dataset.description = item.description;
    el.dataset.image = adjustPath(item.image);
    el.dataset.pdf = adjustPath(item.pdf) || "#";
    el.innerHTML = `
      <div class="image-container">
        <img src="${adjustPath(item.image)}" alt="${item.title}" loading="lazy" />
      </div>`;
    return el;
  }

  async function loadProyectos() {
    const grid = document.querySelector(".gallery-grid.projects-json-target");
    if (!grid) return;
    grid.innerHTML =
      '<p style="color:var(--text-gray);padding:20px">Cargando proyectos…</p>';
    try {
      const projects = await fetchJSON("data/projects.json");
      grid.innerHTML = "";
      projects.forEach((p) => grid.appendChild(buildProjectItem(p)));
      if (typeof initProyectosModal === "function") initProyectosModal();
    } catch (err) {
      console.error("DataLoader (proyectos):", err);
      grid.innerHTML =
        '<p style="color:var(--text-gray);padding:20px">No se pudieron cargar los proyectos.</p>';
    }
  }

  async function loadRecursos() {
    const tabsBar = document.querySelector(".resource-tabs");
    const container = document.querySelector(".resources-json-target");
    if (!tabsBar || !container) return;
    container.innerHTML =
      '<p style="color:var(--text-gray);padding:20px">Cargando recursos…</p>';
    try {
      const data = await fetchJSON("data/resources.json");
      tabsBar.innerHTML = "";
      container.innerHTML = "";
      data.tabs.forEach((tab, i) => {
        const tabEl = document.createElement("div");
        tabEl.className = `resource-tab${i === 0 ? " active" : ""}`;
        tabEl.dataset.target = tab.id;
        tabEl.textContent = tab.label;
        tabsBar.appendChild(tabEl);
        const contentEl = document.createElement("div");
        contentEl.className = `resource-content${i === 0 ? " active" : ""}`;
        contentEl.id = tab.id;
        tab.sections.forEach((section) => {
          const sectionEl = document.createElement("div");
          sectionEl.className = "gallery-section";
          sectionEl.innerHTML = `
            <div class="section-header">
              <i class="${section.icon}"></i>
              <h2>${section.title}</h2>
            </div>
            <div class="gallery-grid"></div>`;
          const innerGrid = sectionEl.querySelector(".gallery-grid");
          section.items.forEach((item) =>
            innerGrid.appendChild(buildResourceItem(item)),
          );
          contentEl.appendChild(sectionEl);
        });
        container.appendChild(contentEl);
      });
      if (typeof initResourceTabs === "function") initResourceTabs();
      if (typeof initRecursosModal === "function") initRecursosModal();
    } catch (err) {
      console.error("DataLoader (recursos):", err);
      container.innerHTML =
        '<p style="color:var(--text-gray);padding:20px">No se pudieron cargar los recursos.</p>';
    }
  }

  return { loadProyectos, loadRecursos };
})();

document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".gallery-grid.projects-json-target"))
    DataLoader.loadProyectos();
  if (document.querySelector(".resources-json-target"))
    DataLoader.loadRecursos();
});
