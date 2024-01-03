// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        korea: resolve(__dirname, 'src/korea.html'),
        food: resolve(__dirname, 'src/food.html'),
        wedding: resolve(__dirname, 'src/wedding.html'),
        misc: resolve(__dirname, 'src/misc.html'),
      },
    },
  },
});
