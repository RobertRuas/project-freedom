import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    // React e Tailwind são necessários para o projeto.
    react(),
    tailwindcss(),
    // Bundle legado para ampliar compatibilidade com navegadores de Smart TV.
    legacy({
      targets: ['defaults', 'chrome >= 49', 'safari >= 10', 'samsung >= 8'],
      renderLegacyChunks: true,
      modernPolyfills: true,
    }),
  ],
  resolve: {
    alias: {
      // Atalho @ apontando para src.
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Tipos de arquivo permitidos para importação bruta.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
