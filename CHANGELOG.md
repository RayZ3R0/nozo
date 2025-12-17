# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-12-18
### Fixed
- Fixed `E2E` testing workflow by adding correct Playwright browser installation.
- Fixed `release.yml` permissions to allow creating releases.
- Fixed `Playwright` headless configuration for extension compatibility.

## [1.0.0] - 2025-12-18
### Added
- Initial release.
- **Link Peek**: Drag & Drop links to preview them.
- **Security**: Blocks `javascript:` URLs.
- **Testing**: Added Unit (Jest) and E2E (Playwright) test suites.
- **CI/CD**: Added GitHub Actions for testing and automated releases.
