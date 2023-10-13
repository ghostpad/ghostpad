import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  // Produces a ts error in vscode, but works and is documented in bun. Investigate.
  base: process.env.NODE_ENV === "production" ? "/static/ghostpad" : "/",
  build: {
    outDir: "../static/ghostpad",
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
  plugins: [tsconfigPaths(), react()],
});
