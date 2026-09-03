import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { contentPlugin } from './plugins/vite-plugin-content.ts'

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths(), contentPlugin()],
  build: {
    // O prerender roda cada rota em Node; um sourcemap por rota não paga.
    sourcemap: false
  }
})
