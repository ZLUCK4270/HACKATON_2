const defaultProjects = [
    {
        id: 'alexander',
        name: 'Alexander Cardenas',
        icon: 'fa-user-astronaut',
        description: 'Proyecto de Alexander'
    },
    {
        id: 'daniela',
        name: 'Daniela Mendoza',
        icon: 'fa-user-ninja',
        description: 'Proyecto de Daniela'
    },
    {
        id: 'luis',
        name: 'Luis Cajacuri',
        icon: 'fa-user-secret',
        description: 'Proyecto de Luis'
    },
    {
        id: 'moreno',
        name: 'Orlando Moreno',
        icon: 'fa-user-tie',
        description: 'Proyecto de Moreno'
    },
    {
        id: 'ricardo',
        name: 'Ricardo Rojas',
        icon: 'fa-user-graduate',
        description: 'Proyecto de Ricardo'
    },
    {
        id: 'valentino',
        name: 'Valentino Cuenca',
        icon: 'fa-user-shield',
        description: 'Proyecto de Valentino'
    }
];

// Initialize projects with URLs from localStorage if available
let projects = defaultProjects.map(p => {
    const savedUrl = localStorage.getItem(`url_${p.id}`);
    return { ...p, url: savedUrl || '' };
});

let activeProjectId = null;

document.addEventListener('DOMContentLoaded', () => {
    const navLinksContainer = document.getElementById('nav-links');
    const iframe = document.getElementById('project-frame');
    const emptyState = document.getElementById('empty-state');
    const setupState = document.getElementById('setup-state');
    const title = document.getElementById('current-project-title');
    const externalLink = document.getElementById('external-link');
    const editUrlBtn = document.getElementById('edit-url-btn');
    const urlInput = document.getElementById('vercel-url-input');
    const saveUrlBtn = document.getElementById('save-url-btn');

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
            iframe.classList.remove('active');
            setupState.classList.remove('hidden');
            externalLink.style.display = 'none';
            editUrlBtn.style.display = 'none';
            urlInput.value = '';
            setTimeout(() => urlInput.focus(), 100);
        } else {
            // Show iframe
            setupState.classList.add('hidden');
            iframe.src = project.url;
            iframe.classList.add('active');
            externalLink.href = project.url;
            externalLink.style.display = 'flex';
            editUrlBtn.style.display = 'flex';
        }
    }

    // Save URL Button
    saveUrlBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (url && activeProjectId) {
            // Ensure valid URL format
            let finalUrl = url;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                finalUrl = 'https://' + url;
            }
            
            // Save to array and local storage
            const projectIndex = projects.findIndex(p => p.id === activeProjectId);
            projects[projectIndex].url = finalUrl;
            localStorage.setItem(`url_${activeProjectId}`, finalUrl);
            
            // Reload view
            selectProject(activeProjectId);
        }
    });

    // Handle Enter key in input
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveUrlBtn.click();
    });

    // Edit URL Button
    editUrlBtn.addEventListener('click', () => {
        const project = projects.find(p => p.id === activeProjectId);
        if (project) {
            iframe.classList.remove('active');
            setupState.classList.remove('hidden');
            externalLink.style.display = 'none';
            editUrlBtn.style.display = 'none';
            urlInput.value = project.url;
            urlInput.focus();
        }
    });

    // Initial render
    renderSidebar();
});
