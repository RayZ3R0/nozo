const fs = require('fs');
const path = require('path');

const changelogPath = path.join(__dirname, '../CHANGELOG.md');
const version = process.argv[2]; // e.g., "1.0.1"

if (!version) {
    console.error('Please provide a version number.');
    process.exit(1);
}

try {
    const changelog = fs.readFileSync(changelogPath, 'utf8');
    const lines = changelog.split('\n');
    let capturing = false;
    let notes = [];

    // Regex to match "## [1.0.1]" or "## 1.0.1"
    const versionHeaderRegex = new RegExp(`^## \\[?${version.replace(/^v/, '')}\\]?`);
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
