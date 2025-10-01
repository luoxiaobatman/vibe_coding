document.addEventListener('DOMContentLoaded', () => {
    const startMenuButton = document.getElementById('start-menu-button');
    const startMenu = document.getElementById('start-menu');
    const clock = document.getElementById('clock');
    const contextMenu = document.getElementById('context-menu');
    const changeWallpaperButton = document.getElementById('change-wallpaper');

    // Toggle Start Menu
    startMenuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        startMenu.style.display = startMenu.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', () => {
        startMenu.style.display = 'none';
        contextMenu.style.display = 'none';
    });

    startMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    desktop.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        contextMenu.style.display = 'block';
        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.top = `${e.clientY}px`;
    });

    contextMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    changeWallpaperButton.addEventListener('click', () => {
        const newWallpaper = prompt('Enter new wallpaper URL:');
        if (newWallpaper) {
            desktop.style.backgroundImage = `url('${newWallpaper}')`;
        }
        contextMenu.style.display = 'none';
    });

    // Update Clock
    function updateClock() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        clock.textContent = `${hours}:${minutes}`;
    }

    setInterval(updateClock, 1000);
    updateClock();

    const apps = [
        {
            name: 'Browser',
            icon: 'https://cdn-icons-png.flaticon.com/512/888/888842.png',
            content: '<iframe src="https://www.bing.com" style="width:100%; height:100%; border:none;"></iframe>'
        },
        {
            name: 'Notepad',
            icon: 'https://cdn-icons-png.flaticon.com/512/2991/2991126.png',
            content: '<textarea style="width:100%; height:100%; border:none; resize: none;"></textarea>'
        }
    ];

    const desktopIconsContainer = document.getElementById('desktop-icons');
    const startMenuContent = document.getElementById('start-menu');
    const appIconsContainer = document.getElementById('app-icons');
    let openWindows = [];
    let activeWindow = null;

    function renderIcons() {
        apps.forEach(app => {
            // Render desktop icon
            const desktopIcon = document.createElement('div');
            desktopIcon.className = 'desktop-icon';
            desktopIcon.innerHTML = `<img src="${app.icon}" alt="${app.name}"><span>${app.name}</span>`;
            desktopIcon.addEventListener('click', () => {
                launchApp(app);
            });
            desktopIconsContainer.appendChild(desktopIcon);

            // Render start menu item
            const startMenuItem = document.createElement('div');
            startMenuItem.className = 'start-menu-item';
            startMenuItem.textContent = app.name;
            startMenuItem.addEventListener('click', () => {
                launchApp(app);
                startMenu.style.display = 'none';
            });
            startMenuContent.appendChild(startMenuItem);
        });
    }

    function launchApp(app) {
        let windowObj = openWindows.find(w => w.title === app.name);
        if (windowObj) {
            setActiveWindow(windowObj);
        } else {
            createWindow(app);
        }
    }

    function setActiveWindow(windowObj) {
        if (activeWindow) {
            activeWindow.element.classList.remove('active');
            activeWindow.taskbarIcon.classList.remove('active');
        }
        activeWindow = windowObj;
        activeWindow.element.classList.add('active');
        activeWindow.taskbarIcon.classList.add('active');
        activeWindow.element.style.zIndex = 101;
        // Set other windows z-index to 100
        openWindows.forEach(w => {
            if (w !== activeWindow) {
                w.element.style.zIndex = 100;
            }
        });
    }

    renderIcons();
});

function createWindow(app) {
    const desktop = document.getElementById('desktop');
    const windowEl = document.createElement('div');
    windowEl.className = 'window';
    windowEl.style.top = `${Math.random() * 100 + 50}px`;
    windowEl.style.left = `${Math.random() * 200 + 50}px`;

    windowEl.innerHTML = `
        <div class="window-header">
            <div class="window-title">${app.name}</div>
            <div class="window-controls">
                <div class="window-control minimize">_</div>
                <div class="window-control maximize">[]</div>
                <div class="window-control close">X</div>
            </div>
        </div>
        <div class="window-body">
            ${app.content}
        </div>
    `;

    desktop.appendChild(windowEl);

    const taskbarIcon = document.createElement('div');
    taskbarIcon.className = 'taskbar-app-icon';
    taskbarIcon.textContent = app.name;
    appIconsContainer.appendChild(taskbarIcon);

    const windowObj = {
        title: app.name,
        element: windowEl,
        taskbarIcon: taskbarIcon,
        isMinimized: false
    };

    openWindows.push(windowObj);
    setActiveWindow(windowObj);

    taskbarIcon.addEventListener('click', () => {
        if (windowObj === activeWindow && !windowObj.isMinimized) {
            windowObj.isMinimized = true;
            windowEl.style.display = 'none';
        } else {
            windowObj.isMinimized = false;
            windowEl.style.display = 'flex';
            setActiveWindow(windowObj);
        }
    });

    const header = windowEl.querySelector('.window-header');
    const closeButton = windowEl.querySelector('.close');
    const minimizeButton = windowEl.querySelector('.minimize');
    const maximizeButton = windowEl.querySelector('.maximize');

    windowEl.addEventListener('mousedown', () => {
        setActiveWindow(windowObj);
    });

    let isDragging = false;
    let dragOffsetX, dragOffsetY;

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragOffsetX = e.clientX - windowEl.offsetLeft;
        dragOffsetY = e.clientY - windowEl.offsetTop;
        windowEl.style.zIndex = 101; // Bring to front
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            windowEl.style.left = `${e.clientX - dragOffsetX}px`;
            windowEl.style.top = `${e.clientY - dragOffsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        // windowEl.style.zIndex = 100;
    });

    closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        desktop.removeChild(windowEl);
        appIconsContainer.removeChild(taskbarIcon);
        openWindows = openWindows.filter(w => w !== windowObj);
        if (activeWindow === windowObj) {
            activeWindow = null;
            if(openWindows.length > 0) {
                setActiveWindow(openWindows[openWindows.length - 1]);
            }
        }
    });

    minimizeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        windowEl.style.display = 'none';
        windowObj.isMinimized = true;
    });

    maximizeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (windowEl.style.width === '100vw') {
            windowEl.style.width = '600px';
            windowEl.style.height = '400px';
            windowEl.style.top = '100px';
            windowEl.style.left = '100px';
        } else {
            windowEl.style.width = '100vw';
            windowEl.style.height = 'calc(100vh - 40px)';
            windowEl.style.top = '0';
            windowEl.style.left = '0';
        }
    });
}
