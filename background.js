const RULE_ID = 1;

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

    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [RULE_ID],
        addRules: [rule]
    });
}

chrome.runtime.onInstalled.addListener(() => {
    updateRules();
});
