const flowbitePlugin = require('flowbite/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{svelte,js,ts}',
    './node_modules/flowbite-svelte/**/*.{js,ts,svelte}',
    './node_modules/flowbite/**/*.js'
  ],
  theme: {
    extend: {}
  },
  plugins: [flowbitePlugin]
};
