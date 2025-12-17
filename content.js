const overlayHTML = `
<div id="nozo-overlay-container">
    <div id="nozo-wrapper">
        <div id="nozo-controls">
            <button class="nozo-btn nozo-maximize-btn" title="Open in New Tab">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </button>
            <button class="nozo-btn nozo-close-btn" title="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
        <div id="nozo-modal">
            <iframe id="nozo-iframe" src="about:blank"></iframe>
        </div>
    </div>
</div>
<div id="nozo-drop-zone">Drop here to Nozo</div>
`;

function initNozo() {
    if (document.getElementById('nozo-overlay-container')) {
        return;
    }

    document.body.insertAdjacentHTML('beforeend', overlayHTML);

    const overlay = document.getElementById('nozo-overlay-container');
    const iframe = document.getElementById('nozo-iframe');
    const closeBtn = document.querySelector('.nozo-close-btn');
    const maxBtn = document.querySelector('.nozo-maximize-btn');
    const dropZone = document.getElementById('nozo-drop-zone');

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
