const fs = require('fs');
const path = require('path');

const changelogPath = path.join(__dirname, '../CHANGELOG.md');
const version = process.argv[2]; // e.g., "1.0.1"

if (!version) {
    console.error('Please provide a version number.');
    process.exit(1);
}

// Escape special regex characters to prevent ReDoS and fix security/detect-non-literal-regexp
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

try {
    const changelog = fs.readFileSync(changelogPath, 'utf8');
    const lines = changelog.split('\n');
    let capturing = false;
    let notes = [];

    // Regex to match "## [1.0.1]" or "## 1.0.1"
    // Version is sanitized via escapeRegExp to prevent ReDoS attacks
    const escapedVersion = escapeRegExp(version.replace(/^v/, ''));
    // eslint-disable-next-line security/detect-non-literal-regexp
    const versionHeaderRegex = new RegExp(`^## \\[?${escapedVersion}\\]?`);
    const nextHeaderRegex = /^## /;

    for (const line of lines) {
        if (versionHeaderRegex.test(line)) {
            capturing = true;
            continue;
        }

        if (capturing) {
            if (nextHeaderRegex.test(line)) {
                break;
            }
            notes.push(line);
        }
    }

    // Trim leading/trailing whitespace/newlines
    const result = notes.join('\n').trim();
    console.log(result);

} catch (err) {
    console.error(`Error reading changelog: ${err.message}`);
    process.exit(1);
}
