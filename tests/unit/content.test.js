/**
 * @jest-environment jsdom
 */

// Mock Chrome API
global.chrome = {
    runtime: {
        onMessage: {
            addListener: jest.fn(),
        },
    },
};

const { initNozo } = require('../../content');

describe('Nozo Content Script', () => {
    beforeEach(() => {
        // Reset DOM
        document.body.innerHTML = '';
        jest.clearAllMocks();

        // Initialize
        initNozo();
    });

    afterEach(() => {
        // Clean up body
        document.body.innerHTML = '';
    });

    test('injects overlay and drop zone into DOM', () => {
        expect(document.getElementById('nozo-overlay-container')).not.toBeNull();
        expect(document.getElementById('nozo-drop-zone')).not.toBeNull();
    });

    describe('Drag and Drop Mechanics', () => {
        test('activates drop zone on dragstart of a link', () => {
            const dropZone = document.getElementById('nozo-drop-zone');
            const link = document.createElement('a');
            link.href = 'https://example.com';
            document.body.appendChild(link);

            const dragStartEvent = new Event('dragstart', { bubbles: true });
            // Mock dataTransfer prop
            Object.defineProperty(dragStartEvent, 'dataTransfer', {
                value: {
                    setData: jest.fn(),
                    effectAllowed: 'none'
                }
            });

            link.dispatchEvent(dragStartEvent);

            expect(dropZone.classList.contains('active')).toBe(true);
            expect(dragStartEvent.dataTransfer.setData).toHaveBeenCalledWith('text/plain', 'https://example.com/');
        });

        test('ignores dragstart of non-link elements', () => {
            const dropZone = document.getElementById('nozo-drop-zone');
            const div = document.createElement('div');
            document.body.appendChild(div);

            const dragStartEvent = new Event('dragstart', { bubbles: true });
            div.dispatchEvent(dragStartEvent);

            expect(dropZone.classList.contains('active')).toBe(false);
        });

        test('opens iframe on drop with valid URL', () => {
            const dropZone = document.getElementById('nozo-drop-zone');
            const overlay = document.getElementById('nozo-overlay-container');
            const iframe = document.getElementById('nozo-iframe');

            const dropEvent = new Event('drop', { bubbles: true });
            Object.defineProperty(dropEvent, 'dataTransfer', {
                value: {
                    getData: jest.fn((format) => {
                        if (format === 'text/plain') return 'https://example.com';
                        return '';
                    })
                }
            });

            // Simulate that we dragged something
            dropZone.classList.add('active');

            dropZone.dispatchEvent(dropEvent);

            expect(iframe.src).toBe('https://example.com/');
            expect(overlay.classList.contains('visible')).toBe(true);
            expect(dropZone.classList.contains('active')).toBe(false);
        });
    });

    describe('Security Edge Cases', () => {
        test('handles javascript: URLs (Should ideally be blocked)', () => {
            const dropZone = document.getElementById('nozo-drop-zone');
            const iframe = document.getElementById('nozo-iframe');

            const dropEvent = new Event('drop', { bubbles: true });
            Object.defineProperty(dropEvent, 'dataTransfer', {
                value: {
                    getData: jest.fn(() => 'javascript:alert(1)')
                }
            });

            dropZone.dispatchEvent(dropEvent);

            expect(iframe.src).toBe('about:blank');
            // Or check that console.warn was called if mocked? 
            // But checking src didn't change is sufficient for "secure".
        });
    });
});
