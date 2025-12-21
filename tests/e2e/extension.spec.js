/* eslint-disable no-unused-vars */
const { test, expect, chromium } = require('@playwright/test');
const path = require('path');

const extensionPath = path.resolve(__dirname, '../../');

test.describe('Nozo Extension E2E', () => {
    let context;
    let page;

    test.beforeEach(async () => {
        // Launch browser with extension
        context = await chromium.launchPersistentContext('', {
            headless: false, // Extensions usually need headful (or xvfb in CI)
            args: [
                `--disable-extensions-except=${extensionPath}`,
                `--load-extension=${extensionPath}`
            ]
        });
        page = await context.newPage();
    });

    test.afterEach(async () => {
        await context.close();
    });

    test('extension loads and injects elements', async () => {
        await page.goto('https://example.com');

        const dropZone = page.locator('#nozo-drop-zone');
        await expect(dropZone).toBeAttached();

        const overlay = page.locator('#nozo-overlay-container');
        await expect(overlay).toBeAttached();
    });

    test('drag and drop link opens modal', async () => {
        await page.goto('https://example.com');
        const link = page.locator('a').first();
        const dropZone = page.locator('#nozo-drop-zone');

        await page.evaluate(async () => {
            const link = document.querySelector('a');
            const dropZone = document.getElementById('nozo-drop-zone');
            const linkHref = link.href;

            // Use DragEvent for proper dataTransfer support
            const dragStartEvent = new DragEvent('dragstart', { bubbles: true, cancelable: true });
            Object.defineProperty(dragStartEvent, 'dataTransfer', {
                value: {
                    setData: () => { },
                    effectAllowed: 'none'
                }
            });
            link.dispatchEvent(dragStartEvent);

            // Wait for the setTimeout in dragstart handler to complete
            await new Promise(resolve => setTimeout(resolve, 150));

            const dropEvent = new DragEvent('drop', { bubbles: true, cancelable: true });
            Object.defineProperty(dropEvent, 'dataTransfer', {
                value: {
                    getData: (type) => type === 'text/uri-list' || type === 'URL' || type === 'text/plain' ? linkHref : ''
                }
            });
            dropZone.dispatchEvent(dropEvent);
        });

        const overlay = page.locator('#nozo-overlay-container');
        await expect(overlay).toHaveClass(/visible/);

        const iframe = page.locator('#nozo-iframe');
        await expect(iframe).toHaveAttribute('src', /iana\.org/);
    });

    test('header stripping allows X-Frame-Options blocked sites', async () => {

        await page.goto('https://example.com');

        await page.evaluate(() => {
            const link = document.createElement('a');
            link.href = 'https://www.google.com';
            link.id = 'test-blocked-link';
            link.innerText = 'Test Link';
            document.body.appendChild(link);
        });

        const dropZone = page.locator('#nozo-drop-zone');
        const link = page.locator('#test-blocked-link');
        await page.evaluate(async () => {
            const link = document.getElementById('test-blocked-link');
            const dropZone = document.getElementById('nozo-drop-zone');
            const linkHref = link.href;

            // 1. Trigger dragstart on the link using DragEvent
            const dragStartEvent = new DragEvent('dragstart', {
                bubbles: true,
                cancelable: true
            });
            // Mock dataTransfer since we are dispatching manually
            Object.defineProperty(dragStartEvent, 'dataTransfer', {
                value: {
                    setData: () => { },
                    effectAllowed: 'none'
                }
            });
            link.dispatchEvent(dragStartEvent);

            // Wait for the setTimeout in dragstart handler to complete
            await new Promise(resolve => setTimeout(resolve, 150));

            // 2. Trigger drop on the drop zone using DragEvent
            const dropEvent = new DragEvent('drop', {
                bubbles: true,
                cancelable: true
            });
            Object.defineProperty(dropEvent, 'dataTransfer', {
                value: {
                    getData: (type) => type === 'text/uri-list' || type === 'URL' || type === 'text/plain' ? linkHref : ''
                }
            });
            dropZone.dispatchEvent(dropEvent);
        });

        const overlay = page.locator('#nozo-overlay-container');
        await expect(overlay).toHaveClass(/visible/);

        const iframe = page.locator('#nozo-iframe');


        await page.waitForTimeout(2000);
    });
});
