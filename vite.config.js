// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: "/dad-and-jane/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        korea: resolve(__dirname, 'korea.html'),
        food: resolve(__dirname, 'food.html'),
        wedding: resolve(__dirname, 'wedding.html'),
        selfies: resolve(__dirname, 'selfies.html'),
        misc: resolve(__dirname, 'misc.html'),
      },
    },
  },
});
