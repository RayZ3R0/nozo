const securityPlugin = require('eslint-plugin-security');
const js = require('@eslint/js');
const globals = require('globals');
const jestPlugin = require('eslint-plugin-jest');

module.exports = [
    js.configs.recommended,
    securityPlugin.configs.recommended,
    jestPlugin.configs['flat/recommended'],
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                node: "readonly",
                chrome: "readonly",
                browser: "readonly",
            },
            ecmaVersion: 12,
            sourceType: "module"
        },
        rules: {
            'security/detect-object-injection': 'warn',
            'no-eval': 'error',
            'no-implied-eval': 'error',
            // Disable some noisy rules if needed, but for "hard" security, keep them.
        }
    }
];
