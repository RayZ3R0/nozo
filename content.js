// Nozo Content Script

// Cross-browser storage API
const storage = typeof browser !== 'undefined' ? browser.storage : chrome.storage;

const DEFAULT_POSITION = 'bottom-center';

async function loadDropZonePosition() {
    try {
        const result = await storage.sync.get({ dropZonePosition: DEFAULT_POSITION });
        return result.dropZonePosition || DEFAULT_POSITION;
    } catch (err) {
        console.warn('Nozo: Could not load settings, using defaults', err);
        return DEFAULT_POSITION;
    }
}

async function initNozo() {
    if (document.getElementById('nozo-overlay-container')) {
        return;
    }

    // Load user settings
    const dropZonePosition = await loadDropZonePosition();

    // Build overlay container
    const overlayContainer = document.createElement('div');
    overlayContainer.id = 'nozo-overlay-container';

    const wrapper = document.createElement('div');
    wrapper.id = 'nozo-wrapper';

    const controls = document.createElement('div');
    controls.id = 'nozo-controls';

    const maxBtn = document.createElement('button');
    maxBtn.className = 'nozo-btn nozo-maximize-btn';
    maxBtn.title = 'Open in New Tab';
    maxBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'nozo-btn nozo-close-btn';
    closeBtn.title = 'Close';
    closeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'nozo-btn nozo-copy-btn';
    copyBtn.title = 'Copy URL';
    const copyIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    const checkIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    copyBtn.innerHTML = copyIcon;

    controls.appendChild(maxBtn);
    controls.appendChild(closeBtn);
    controls.appendChild(copyBtn);

    const modal = document.createElement('div');
    modal.id = 'nozo-modal';

    const iframe = document.createElement('iframe');
    iframe.id = 'nozo-iframe';
    iframe.src = 'about:blank';

    modal.appendChild(iframe);
    wrapper.appendChild(controls);
    wrapper.appendChild(modal);
    overlayContainer.appendChild(wrapper);

    const dropZone = document.createElement('div');
    dropZone.id = 'nozo-drop-zone';
    dropZone.className = `nozo-position-${dropZonePosition}`;
    dropZone.textContent = 'Drop here to Nozo';

    document.body.appendChild(overlayContainer);
    document.body.appendChild(dropZone);

    const overlay = overlayContainer;

    function closeNozo() {
        overlay.classList.remove('visible');
        setTimeout(() => {
            iframe.src = 'about:blank';
        }, 350);
    }

    function openNozo(url) {
        iframe.src = url;
        overlay.classList.add('visible');
    }

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeNozo();
    });

    closeBtn.addEventListener('click', closeNozo);

    maxBtn.addEventListener('click', () => {
        window.open(iframe.src, '_blank');
        closeNozo();
    });

    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(iframe.src);
            copyBtn.innerHTML = checkIcon;
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.innerHTML = copyIcon;
                copyBtn.classList.remove('copied');
            }, 1500);
        } catch (err) {
            console.error('Nozo: Failed to copy URL', err);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('visible')) {
            closeNozo();
        }
    });

    let draggedLink = null;

    document.addEventListener('dragstart', (e) => {
        let target = e.target;
        if (target.nodeType === 3) target = target.parentNode;

        const anchor = target.closest('a');

        if (anchor && anchor.href) {
            draggedLink = anchor.href;
            dropZone.classList.add('active');

            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('text/plain', anchor.href);
            e.dataTransfer.setData('text/uri-list', anchor.href);
        }
    });

    document.addEventListener('dragend', () => {
        setTimeout(() => {
            draggedLink = null;
            if (dropZone) {
                dropZone.classList.remove('active');
                dropZone.classList.remove('hovered');
            }
        }, 100);
    });

    dropZone.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dropZone.classList.add('hovered');
    });

    dropZone.addEventListener('dragleave', (e) => {
        if (e.relatedTarget && !dropZone.contains(e.relatedTarget)) {
            dropZone.classList.remove('hovered');
        }
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('active');
        dropZone.classList.remove('hovered');

        const url = draggedLink || e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('URL') || e.dataTransfer.getData('text/plain');

        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            openNozo(url);
        } else {
            console.warn('Nozo: Blocked potentially unsafe URL:', url);
        }

        draggedLink = null;
    });

    // Provide global for E2E testing if needed
    window.openNozo = openNozo;

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((request) => {
            if (request.action === "openNozo" && request.url) {
                openNozo(request.url);
            }
        });
    }
}

// Export for testing or auto-run
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initNozo };
} else {
    initNozo();
}
