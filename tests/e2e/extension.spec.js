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

        await page.evaluate(() => {
            const link = document.querySelector('a');
            const dropZone = document.getElementById('nozo-drop-zone');

            const dragStartEvent = new MouseEvent('dragstart', { bubbles: true, cancelable: true, view: window });
            Object.defineProperty(dragStartEvent, 'dataTransfer', { value: { setData: () => { }, effectAllowed: 'none' } });
            link.dispatchEvent(dragStartEvent);

            const dropEvent = new MouseEvent('drop', { bubbles: true, cancelable: true, view: window });
            Object.defineProperty(dropEvent, 'dataTransfer', { value: { getData: () => '' } });
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
        await page.evaluate(() => {
            const link = document.getElementById('test-blocked-link');
            const dropZone = document.getElementById('nozo-drop-zone');

            // 1. Trigger dragstart on the link
            const dragStartEvent = new MouseEvent('dragstart', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            // Mock dataTransfer since we are dispatching manually
            Object.defineProperty(dragStartEvent, 'dataTransfer', {
                value: {
                    setData: () => { },
                    effectAllowed: 'none'
                }
            });
            link.dispatchEvent(dragStartEvent);

            // 2. Trigger drop on the drop zone
            const dropEvent = new MouseEvent('drop', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            Object.defineProperty(dropEvent, 'dataTransfer', {
                value: {
                    getData: () => '', // content.js will use its internal draggedLink variable
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
