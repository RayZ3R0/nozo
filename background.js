const RULE_ID = 1;

// Cross-browser compatibility API
const nativeAPI = typeof browser !== "undefined" ? browser : chrome;

// Helper loop to handle both Promise (Firefox) and Callback (Chrome) behaviors if needed
// However, Chrome MV3 also supports promises for many APIs now.
// We'll stick to a clean async/await pattern where possible or a polyfill approach.

async function updateRules() {
    const rule = {
        id: RULE_ID,
        priority: 1,
        action: {
            type: "modifyHeaders",
            responseHeaders: [
                { header: "X-Frame-Options", operation: "remove" },
                { header: "Content-Security-Policy", operation: "remove" }
            ]
        },
        condition: {
            urlFilter: "*",
            resourceTypes: ["sub_frame"]
        }
    };

    console.log("Nozo: Header stripping rules active for sub_frames.");

    // Firefox 'browser' API returns a Promise. Chrome 'chrome' API usually requires a callback
    // but in MV3 many methods return a promise if callback is omitted.
    try {
        if (typeof browser !== "undefined") {
            await browser.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: [RULE_ID],
                addRules: [rule]
            });
        } else {
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: [RULE_ID],
                addRules: [rule]
            });
        }
    } catch (error) {
        console.error("Nozo: Failed to update rules", error);
    }
}

nativeAPI.runtime.onInstalled.addListener(() => {
    updateRules();
});
