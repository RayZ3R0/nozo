// Cross-browser API
const storage = typeof browser !== 'undefined' ? browser.storage : chrome.storage;

const DEFAULT_SETTINGS = {
    dropZonePosition: 'bottom-center'
};

// Load saved settings
async function loadSettings() {
    try {
        const result = await storage.sync.get(DEFAULT_SETTINGS);
        const position = result.dropZonePosition || DEFAULT_SETTINGS.dropZonePosition;

        const radio = document.querySelector(`input[value="${position}"]`);
        if (radio) {
            radio.checked = true;
        }
    } catch (err) {
        console.error('Nozo: Failed to load settings', err);
    }
}

// Save settings
async function saveSettings(position) {
    try {
        await storage.sync.set({ dropZonePosition: position });
        showStatus('Settings saved!');
    } catch (err) {
        console.error('Nozo: Failed to save settings', err);
    }
}

// Show status message
function showStatus(message) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = 'status show success';

    setTimeout(() => {
        status.className = 'status';
    }, 2000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();

    // Listen for radio changes
    const radios = document.querySelectorAll('input[name="dropZonePosition"]');
    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            saveSettings(e.target.value);
        });
    });
});
