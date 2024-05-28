import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  server:{
    host: true,
  },
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': '/src',
      '~bootstrap': 'bootstrap',
      "assets": '/src/assets',
      "components": '/src/components',
      "game": '/src/game',
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
                @import "./src/assets/sass/_variables.scss";
            `
      }
    }
  },

})
