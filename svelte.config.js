import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess({
    style: {
      postcss: true
    }
  })
};

export default config;
