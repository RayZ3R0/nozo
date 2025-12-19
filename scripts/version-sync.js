#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Read current version from package.json (already bumped by npm version)
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;

// Update manifest.json
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
manifest.version = version;
fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 4));

// Update manifest.firefox.json
const firefoxManifest = JSON.parse(fs.readFileSync('manifest.firefox.json', 'utf8'));
firefoxManifest.version = version;
fs.writeFileSync('manifest.firefox.json', JSON.stringify(firefoxManifest, null, 4));

// Git add manifest.json and manifest.firefox.json so they are committed by npm version
execSync('git add manifest.json manifest.firefox.json');

console.log(`Updated manifest.json and manifest.firefox.json to version ${version}`);
