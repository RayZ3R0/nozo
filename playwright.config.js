// playwright.config.js
/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
    testDir: './tests/e2e',
    timeout: 30000,
    expect: {
        timeout: 5000
    },
    use: {
        headless: false, // Extensions usually need headful
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        trace: 'on-first-retry',
    },
};

module.exports = config;
