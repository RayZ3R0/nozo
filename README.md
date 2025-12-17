# Nozo

> Alt+Click (or Drag & Drop) any link to peek at it in a modal window.

Nozo is a lightweight browser extension that lets you preview links without leaving your current page.

## Features
- **Link Peek**: Drag any link to the drop zone to open it in a modal.
- **Secure**: Blocks potentially unsafe URLs (e.g., `javascript:`).
- **Lightweight**: Minimal performance impact.

## Installation

### From Source (Developer Mode)
1. Clone this repository.
2. Open Chrome/Edge and go to `chrome://extensions`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked**.
5. Select the cloned directory.

### From Release
(Coming soon to Chrome Web Store)

## Development

### Prerequisites
- Node.js 18+
- npm

### Setup
```bash
npm install
```

### Testing
We use **Jest** for unit tests and **Playwright** for End-to-End (E2E) testing.

```bash
# Run unit tests
npm test

# Run E2E tests (requires Chromium)
npx playwright install chromium
npm run test:e2e
```

### Packaging
To create a distributable `.zip` file (excluding tests and dev files):

```bash
npm run pack
```
This generates `extension.zip` in the root directory.

## License
ISC
