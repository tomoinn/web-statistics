import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';

export default defineConfig({
  plugins: [
    vue(),
    ...vuetify({ autoImport: true })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/vuetify/')) {
            return 'vuetify';
          }

          if (id.includes('/node_modules/@mdi/font/')) {
            return 'mdi-font';
          }

          if (id.includes('/node_modules/')) {
            return 'vendor';
          }

          if (
            id.includes('/src/components/CircularPlot')
            || id.includes('/src/components/circular-plot')
            || id.includes('/src/utils/circularPlot')
          ) {
            return 'circular-plot';
          }
        }
      }
    }
  },
  test: {
    environment: 'jsdom'
  }
});
