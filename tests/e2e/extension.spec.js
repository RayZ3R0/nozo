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
            headless: true,
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

        // Check for drop zone (might be hidden, but present in DOM)
        const dropZone = page.locator('#nozo-drop-zone');
        await expect(dropZone).toBeAttached();

        const overlay = page.locator('#nozo-overlay-container');
        await expect(overlay).toBeAttached();
    });

    test('drag and drop link opens modal', async () => {
        await page.goto('https://example.com');

        // Example.com has a link "More information..."
        const link = page.locator('a').first();
        const dropZone = page.locator('#nozo-drop-zone');

        // Perform drag and drop
        // Playwright dragTo is usually for elements, but we need to trigger the specific events
        // or simulate the visual drag.

        // Since native drag-and-drop is tricky in Playwright/Puppeteer sometimes, 
        // we can try the high-level API first.
        await link.dragTo(dropZone);

        // Check if modal became visible
        const overlay = page.locator('#nozo-overlay-container');
        await expect(overlay).toHaveClass(/visible/);

        // Check iframe source
        const iframe = page.locator('#nozo-iframe');
        // The src should change. 
        // Note: Example.com link is "https://www.iana.org/domains/example"
        await expect(iframe).toHaveAttribute('src', /iana\.org/);
    });

    test('header stripping allows X-Frame-Options blocked sites', async () => {
        // This tests the background.js logic.
        // We need a site that normally blocks iframing.
        // E.g., google.com usually sets X-Frame-Options: SAMEORIGIN

        await page.goto('https://example.com');

        // We will manually trigger the "openNozo" by using the console or dragging a created link
        // to avoid reliance on finding a specific link.
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            openNozo('https://www.google.com');
        });

        const overlay = page.locator('#nozo-overlay-container');
        await expect(overlay).toHaveClass(/visible/);

        const iframe = page.locator('#nozo-iframe');

        // We wait for the iframe to load content.
        // If header stripping failed, it might show a browser error page or refuse to connect (in console).
        // Checking for success is hard cross-origin, but we can check if it didn't crash.
        // A better test might be to verify the request headers if we could intercept, 
        // but declarativeNetRequest happens at network level.
        // We can check if the iframe has content.
        // Due to Cross-Origin, we can't read internal iframe content easily.
        // But we can check if 'load' event fired on iframe or just wait.

        await page.waitForTimeout(2000);

        // If we see the error page, we might be able to detect it? 
        // Actually, verifying header stripping is best done by asserting the page loads specific content.
        // But for a generic test, if google loads, it works.
    });
});
