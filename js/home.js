document.addEventListener('DOMContentLoaded', function () {
    initPlanetarySystem();
    initResourceOverlays();
    loadLatestProjectsFromJSON();
});

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
            icon: 'fas fa-file-alt'
        },
        {
            keywords: ['trucos', 'cheat', 'hoja', 'cheatsheet', 'sheet'],
            label: 'Hojas de Trucos',
            icon: 'fas fa-clipboard-list'
        },
        {
            keywords: ['tutorial', 'tutoriales', 'guide', 'curso'],
            label: 'Tutoriales',
            icon: 'fas fa-graduation-cap'
        },
        {
            keywords: ['herramienta', 'tool', 'recurso', 'resource'],
            label: 'Herramientas',
            icon: 'fas fa-tools'
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
    if (!gallery) {
        console.warn('home.js: no se encontró .project-gallery');
        return;
    }
    
    gallery.innerHTML = '<p style="color: var(--text-gray); padding: 20px; text-align: center;">Cargando proyectos...</p>';
    
    try {
        const response = await fetch('data/projects.json');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const projects = await response.json();
        
        if (!projects || projects.length === 0) {
            throw new Error('El archivo JSON está vacío o no contiene proyectos');
        }
        
        const sorted = [...projects].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const display = sorted.slice(0, 5);
        
        gallery.innerHTML = '';
        
        gallery.style.gridTemplateColumns = `repeat(${display.length}, 1fr)`;
        
        display.forEach((project, index) => {
            if (index === 0) {
                const wrapper = document.createElement('div');
                wrapper.className = 'project-gallery-item';
                
                const img = document.createElement('img');
                img.src = project.image;
                img.alt = project.title;
                img.loading = 'lazy';
                
                img.onerror = function() {
                    console.error(`Error cargando imagen: ${project.image}`);
                    this.style.background = 'linear-gradient(45deg, #2a0511, #3d0a1a)';
                    this.alt = `[No se pudo cargar: ${project.title}]`;
                };
                
                const badge = document.createElement('span');
                badge.className = 'latest-badge';
                badge.textContent = 'NUEVO';
                
                wrapper.appendChild(img);
                wrapper.appendChild(badge);
                gallery.appendChild(wrapper);
            } else {
                const img = document.createElement('img');
                img.src = project.image;
                img.alt = project.title;
                img.loading = 'lazy';
                
                img.onerror = function() {
                    console.error(`Error cargando imagen: ${project.image}`);
                    this.style.background = 'linear-gradient(45deg, #2a0511, #3d0a1a)';
                    this.alt = `[No se pudo cargar: ${project.title}]`;
                };
                
                gallery.appendChild(img);
            }
        });
        
     
        if (sorted.length > 0) {
            fillLatestCard(sorted[0]);
        }
        
        console.log(`✓ Cargados ${display.length} proyectos desde JSON`);
        
    } catch (err) {
        console.error('Error cargando proyectos desde JSON:', err.message);
        
        gallery.innerHTML = `
            <div style="
                color: var(--text-gray); 
                padding: 30px; 
                text-align: center;
                background: rgba(214,9,59,0.1);
                border: 1px solid rgba(214,9,59,0.3);
                border-radius: 12px;
                grid-column: 1 / -1;
            ">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--primary); margin-bottom: 10px;"></i>
                <p style="margin: 10px 0; font-weight: 600;">No se pudieron cargar los proyectos</p>
                <p style="margin: 5px 0; font-size: 0.9rem; opacity: 0.8;">Error: ${err.message}</p>
                <p style="margin: 10px 0; font-size: 0.85rem; opacity: 0.7;">
                    Asegúrate de que el archivo <code>data/projects.json</code> existe y es válido
                </p>
            </div>
        `;
        
        console.log('Intentando fallback con imágenes estáticas...');
        fallbackProjectsStatic();
    }
}

function fillLatestCard(project) {
    if (!project) return;
    
    const card = document.querySelector('.latest-project-card');
    if (!card) return;
    
    const set = (selector, value, attr = 'textContent') => {
        const el = card.querySelector(selector);
        if (el) el[attr] = value;
    };
    
    set('.latest-project-title', project.title);
    set('.latest-project-desc', project.description);
    
    const imgEl = card.querySelector('.latest-project-img');
    if (imgEl) {
        imgEl.src = project.image;
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

function fallbackProjectsStatic() {
    const gallery = document.querySelector('.project-gallery');
    if (!gallery) return;
    
    const staticProjects = [
        {
            src: 'images/document_gallery/Projects/Portada_Aseguramiento_de_Calidad_en_TooShop.png',
            alt: 'Aseguramiento de Calidad en TooShop'
        },
        {
            src: 'images/document_gallery/Projects/Portada_Crowdsourced_Ideation_Solution.png',
            alt: 'Crowdsourced Ideation Solution'
        },
        {
            src: 'images/document_gallery/Projects/Portada_Statistical_Analysis_The_Impact_of_AI_on_the_Labour_Market_by_2030.png',
            alt: 'Análisis Estadístico del Impacto de la IA'
        },
        {
            src: 'images/document_gallery/Projects/Portada_Aseguramiento_de_Calidad_en_OrangeHRM.png',
            alt: 'Aseguramiento de Calidad en OrangeHRM'
        },
        {
            src: 'images/document_gallery/Projects/Portada_UNO_Card_Game.png',
            alt: 'Juego de Cartas UNO'
        }
    ];
    
    gallery.innerHTML = '';
    gallery.style.gridTemplateColumns = `repeat(${staticProjects.length}, 1fr)`;
    
    staticProjects.forEach((project, index) => {
        const img = document.createElement('img');
        img.src = project.src;
        img.alt = project.alt;
        img.loading = 'lazy';
        
        img.onerror = function() {
            console.error(`Error cargando imagen estática: ${project.src}`);
            this.style.background = 'linear-gradient(45deg, #2a0511, #3d0a1a)';
            this.style.minHeight = '300px';
        };
        
        gallery.appendChild(img);
    });
    
    console.log('✓ Fallback: Usando imágenes estáticas');
}