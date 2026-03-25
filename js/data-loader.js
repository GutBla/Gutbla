const DataLoader = (() => {
  const IS_SUBPAGE = window.location.pathname.includes("/pages/");
  const BASE = IS_SUBPAGE ? "../" : "";

  function adjustPath(relativePath) {
    if (!relativePath) return "";
    if (
      relativePath.startsWith("http") ||
      relativePath.startsWith("//") ||
      relativePath.startsWith("/")
    )
      return relativePath;

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

  function buildResourceItem(item, tabId) {
    const el = document.createElement("div");
    el.className = `gallery-item resource-item resource-item--${tabId}`;
    el.dataset.title = item.title;
    el.dataset.description = item.description;
    el.dataset.image = adjustPath(item.image);
    el.dataset.pdf = adjustPath(item.pdf) || "#";
    el.dataset.tabId = tabId;

    el.innerHTML = `
      <div class="image-container">
        <img src="${adjustPath(item.image)}" alt="${item.title}" loading="lazy" />
      </div>`;
    return el;
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
            innerGrid.appendChild(buildResourceItem(item, tab.id)),
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

  function buildPortfolioItem(item) {
    const tagsHTML = (item.tags || [])
      .map((tag, i) => {
        const icon = item.tagIcons?.[i]
          ? `<i class="${item.tagIcons[i]}"></i> `
          : "";
        return `<span>${icon}${tag}</span>`;
      })
      .join("");

    const el = document.createElement("div");
    el.className = "project-card";

    el.innerHTML = `
      <div class="project-image">
        <img src="${adjustPath(item.image)}" alt="${item.title}">
      </div>
      <div class="project-details">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <div class="project-tags">${tagsHTML}</div>
        <a href="${item.link || "proyectos.html"}" class="btn">
          <i class="fas fa-arrow-right"></i> Ver detalles
        </a>
      </div>`;

    return el;
  }

  async function loadPortafolio() {
    const container = document.querySelector(".portfolio-json-target");
    if (!container) return;

    container.innerHTML =
      '<p style="color:var(--text-gray);padding:20px">Cargando portafolio…</p>';

    try {
      const categories = await fetchJSON("data/portfolio.json");
      container.innerHTML = "";

      categories.forEach((cat) => {
        const section = document.createElement("section");
        section.className = "sec";

        section.innerHTML = `
          <div class="section-header">
            <i class="${cat.categoryIcon}"></i>
            <h2>${cat.category}</h2>
          </div>
          <div class="projects-grid portfolio-cat-grid"></div>`;

        const grid = section.querySelector(".portfolio-cat-grid");

        cat.items.forEach((item) => grid.appendChild(buildPortfolioItem(item)));

        container.appendChild(section);
      });
    } catch (err) {
      console.error("DataLoader (portafolio):", err);
      container.innerHTML =
        '<p style="color:var(--text-gray);padding:20px">No se pudo cargar el portafolio.</p>';
    }
  }

  function buildBlogItem(post) {
    const tagsHTML = (post.tags || []).map((t) => `<span>${t}</span>`).join("");

    const imageContent = post.image
      ? `<img src="${adjustPath(post.image)}" alt="${post.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;" />`
      : `<i class="${post.icon || "fas fa-newspaper"} fa-4x" style="color:white;"></i>`;

    const bgStyle = post.image
      ? ""
      : `style="background:${post.gradient || "linear-gradient(45deg,#505FF5,#8A4FFF)"}"`;

    const el = document.createElement("div");
    el.className = "project-card";

    el.innerHTML = `
      <div class="project-image" ${bgStyle}>
        ${imageContent}
      </div>
      <div class="project-details">
        <h3>${post.title}</h3>
        <p>${post.description}</p>
        <div class="project-tags">${tagsHTML}</div>
        <a href="${post.link || "#"}" class="btn">Leer artículo</a>
      </div>`;

    return el;
  }

  async function loadBlog() {
    const grid = document.querySelector(".blog-json-target");
    if (!grid) return;

    grid.innerHTML =
      '<p style="color:var(--text-gray);padding:20px">Cargando artículos…</p>';

    try {
      const posts = await fetchJSON("data/blog.json");
      grid.innerHTML = "";
      posts.forEach((post) => grid.appendChild(buildBlogItem(post)));
    } catch (err) {
      console.error("DataLoader (blog):", err);
      grid.innerHTML =
        '<p style="color:var(--text-gray);padding:20px">No se pudieron cargar los artículos.</p>';
    }
  }

  return { loadProyectos, loadRecursos, loadPortafolio, loadBlog };
})();

document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".gallery-grid.projects-json-target"))
    DataLoader.loadProyectos();
  if (document.querySelector(".resources-json-target"))
    DataLoader.loadRecursos();
  if (document.querySelector(".portfolio-json-target"))
    DataLoader.loadPortafolio();
  if (document.querySelector(".blog-json-target")) DataLoader.loadBlog();
});
