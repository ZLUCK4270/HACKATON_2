const defaultProjects = [
    {
        id: 'alexander',
        name: 'Alexander Cardenas',
        icon: 'fa-user-astronaut',
        description: 'Proyecto de Alexander',
        url: 'https://restaurante-frontend-cbvmld7gk-zluck4270s-projects.vercel.app'
    },
    {
        id: 'daniela',
        name: 'Daniela Mendoza',
        icon: 'fa-user-ninja',
        description: 'Proyecto de Daniela',
        url: 'https://restaurante-frontend-ai7e7s3oa-zluck4270s-projects.vercel.app'
    },
    {
        id: 'luis',
        name: 'Luis Cajacuri',
        icon: 'fa-user-secret',
        description: 'Proyecto de Luis',
        url: 'https://frontend-olh7i8o56-zluck4270s-projects.vercel.app'
    },
    {
        id: 'moreno',
        name: 'Orlando Moreno',
        icon: 'fa-user-tie',
        description: 'Proyecto de Moreno',
        url: 'https://restaurante-frontend-dr3ph828p-zluck4270s-projects.vercel.app'
    },
    {
        id: 'ricardo',
        name: 'Ricardo Rojas',
        icon: 'fa-user-graduate',
        description: 'Proyecto de Ricardo',
        url: 'https://restaurante-frontend-oe55fci3z-zluck4270s-projects.vercel.app'
    },
    {
        id: 'valentino',
        name: 'Valentino Cuenca',
        icon: 'fa-user-shield',
        description: 'Proyecto de Valentino',
        url: 'https://restaurante-frontend-cur0j7fqu-zluck4270s-projects.vercel.app'
    }
];

// Initialize projects with URLs from localStorage if available
let projects = defaultProjects.map(p => {
    const savedUrl = localStorage.getItem(`url_${p.id}`);
    return { ...p, url: savedUrl || p.url || '' };
});

let activeProjectId = null;

document.addEventListener('DOMContentLoaded', () => {
    const navLinksContainer = document.getElementById('nav-links');
    const emptyState = document.getElementById('empty-state');
    const setupState = document.getElementById('setup-state');
    const launchState = document.getElementById('launch-state');
    
    const title = document.getElementById('current-project-title');
    const editUrlBtn = document.getElementById('edit-url-btn');
    const urlInput = document.getElementById('vercel-url-input');
    const saveUrlBtn = document.getElementById('save-url-btn');
    
    const launchLink = document.getElementById('launch-link');
    const launchTitle = document.getElementById('launch-title');

    function renderSidebar() {
        navLinksContainer.innerHTML = '';
        projects.forEach(project => {
            const li = document.createElement('li');
            li.className = 'nav-item';
            if (project.id === activeProjectId) li.classList.add('active');
            
            const isConfigured = project.url.trim() !== '';
            
            li.innerHTML = `
                <div class="nav-item-content">
                    <i class="fa-solid ${project.icon}"></i>
                    <span>${project.name}</span>
                </div>
                <div class="status-dot ${isConfigured ? 'configured' : ''}" title="${isConfigured ? 'Configurado' : 'Falta URL'}"></div>
            `;
            
            li.addEventListener('click', () => selectProject(project.id));
            navLinksContainer.appendChild(li);
        });
    }

    function selectProject(id) {
        activeProjectId = id;
        const project = projects.find(p => p.id === id);
        renderSidebar();

        title.textContent = `Proyecto de ${project.name}`;
        emptyState.classList.add('hidden');

        if (project.url.trim() === '') {
            // Show setup form
            launchState.classList.add('hidden');
            setupState.classList.remove('hidden');
            editUrlBtn.style.display = 'none';
            urlInput.value = '';
            setTimeout(() => urlInput.focus(), 100);
        } else {
            // Show Launch state instead of iframe
            setupState.classList.add('hidden');
            launchState.classList.remove('hidden');
            
            launchTitle.textContent = `Lanzar Proyecto de ${project.name}`;
            launchLink.href = project.url;
            editUrlBtn.style.display = 'flex';
        }
    }

    // Save URL Button
    saveUrlBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (url && activeProjectId) {
            let finalUrl = url;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                finalUrl = 'https://' + url;
            }
            
            const projectIndex = projects.findIndex(p => p.id === activeProjectId);
            projects[projectIndex].url = finalUrl;
            localStorage.setItem(`url_${activeProjectId}`, finalUrl);
            
            selectProject(activeProjectId);
        }
    });

    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveUrlBtn.click();
    });

    // Edit URL Button
    editUrlBtn.addEventListener('click', () => {
        const project = projects.find(p => p.id === activeProjectId);
        if (project) {
            launchState.classList.add('hidden');
            setupState.classList.remove('hidden');
            editUrlBtn.style.display = 'none';
            urlInput.value = project.url;
            urlInput.focus();
        }
    });

    // Initial render
    renderSidebar();
});
