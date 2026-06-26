const defaultProjects = [
    {
        id: 'alexander',
        name: 'Alexander Cardenas',
        icon: 'fa-user-astronaut',
        description: 'Proyecto de Alexander',
        url: 'https://restaurante-frontend-cbvmld7gk-zluck4270s-projects.vercel.app',
        url2: ''
    },
    {
        id: 'daniela',
        name: 'Daniela Mendoza',
        icon: 'fa-user-ninja',
        description: 'Proyecto de Daniela',
        url: 'https://restaurante-frontend-ai7e7s3oa-zluck4270s-projects.vercel.app',
        url2: 'https://frontend-d0krch5ka-zluck4270s-projects.vercel.app'
    },
    {
        id: 'luis',
        name: 'Luis Cajacuri',
        icon: 'fa-user-secret',
        description: 'Proyecto de Luis',
        url: 'https://frontend-olh7i8o56-zluck4270s-projects.vercel.app',
        url2: ''
    },
    {
        id: 'moreno',
        name: 'Orlando Moreno',
        icon: 'fa-user-tie',
        description: 'Proyecto de Moreno',
        url: 'https://restaurante-frontend-dr3ph828p-zluck4270s-projects.vercel.app',
        url2: 'https://dashboard-unificado-de-redes-sociales-j8lhhkw5n.vercel.app'
    },
    {
        id: 'ricardo',
        name: 'Ricardo Rojas',
        icon: 'fa-user-graduate',
        description: 'Proyecto de Ricardo',
        url: 'https://restaurante-frontend-oe55fci3z-zluck4270s-projects.vercel.app',
        url2: 'https://prueba-rsoft-jgu9gp59e-zluck4270s-projects.vercel.app'
    },
    {
        id: 'valentino',
        name: 'Valentino Cuenca',
        icon: 'fa-user-shield',
        description: 'Proyecto de Valentino',
        url: 'https://restaurante-frontend-cur0j7fqu-zluck4270s-projects.vercel.app',
        url2: 'https://rpsoft-social-dashboard-bw48t147h-zluck4270s-projects.vercel.app'
    }
];

// Initialize projects with URLs from localStorage if available
let projects = defaultProjects.map(p => {
    const savedUrl = localStorage.getItem(`url_${p.id}`);
    const savedUrl2 = localStorage.getItem(`url2_${p.id}`);
    return { 
        ...p, 
        url: savedUrl || p.url || '',
        url2: savedUrl2 || p.url2 || '' 
    };
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
    
    const launchTitle = document.getElementById('launch-title');
    const launchButtonsContainer = document.getElementById('launch-buttons-container');

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

        if (project.url.trim() === '' && !project.url.includes('INSERT_')) {
            // Setup logic only applies if first url is completely missing
            launchState.classList.add('hidden');
            setupState.classList.remove('hidden');
            editUrlBtn.style.display = 'none';
            urlInput.value = '';
            setTimeout(() => urlInput.focus(), 100);
        } else {
            // Show Launch state
            setupState.classList.add('hidden');
            launchState.classList.remove('hidden');
            
            launchTitle.textContent = `Lanzar Trabajo de ${project.name}`;
            launchButtonsContainer.innerHTML = ''; // clear previous
            
            // Generate Button 1
            if (project.url.trim() !== '' && !project.url.includes('INSERT_')) {
                const btn1 = document.createElement('a');
                btn1.href = project.url;
                btn1.target = '_blank';
                btn1.className = 'btn btn-primary';
                btn1.style = 'display: inline-flex; justify-content: center; padding: 14px 28px; font-size: 16px;';
                btn1.innerHTML = `<i class="fa-solid fa-external-link-alt"></i> Proyecto 1`;
                launchButtonsContainer.appendChild(btn1);
            }

            // Generate Button 2 if it exists
            if (project.url2.trim() !== '' && !project.url2.includes('INSERT_')) {
                const btn2 = document.createElement('a');
                btn2.href = project.url2;
                btn2.target = '_blank';
                btn2.className = 'btn btn-outline';
                btn2.style = 'display: inline-flex; justify-content: center; padding: 14px 28px; font-size: 16px; border: 1px solid var(--primary); color: var(--text-main); background: rgba(99, 102, 241, 0.1);';
                btn2.innerHTML = `<i class="fa-solid fa-external-link-alt"></i> Proyecto 2`;
                launchButtonsContainer.appendChild(btn2);
            }
            
            editUrlBtn.style.display = 'flex';
        }
    }

    // Save URL Button (Only saves URL 1 for simplicity in this demo, unless we add 2 inputs)
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
