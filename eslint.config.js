import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import prettierConfig from 'eslint-config-prettier/flat'

export default [
  {
    ignores: ['dist/**', 'public/**', 'src/data/scData_generated.js'],
  },

  // Vue 3 essential rules (all at "error"), plus the SFC parser/processor setup.
  ...pluginVue.configs['flat/essential'],

  // The app itself is browser-only: no bundler/Node globals in src/.
  {
    files: ['**/*.js', '**/*.vue'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
    },
  },

  // Tooling configs run in Node, not the browser.
  {
    files: ['vite.config.js', 'eslint.config.js', 'prettier.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // Must stay last: turns off every rule that would fight Prettier.
  prettierConfig,
]
