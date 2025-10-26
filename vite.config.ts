import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    nitro(/* 
      // nitro config goes here, e.g.
      { preset: 'node-server' }
    */),
    viteReact(),
  ],
  optimizeDeps: {
    include: ['@google-cloud/firestore > google-gax'],
  },
  ssr: {
    external: ['@google-cloud/firestore'],
    noExternal: ["@mantine/*"],
  },
  define: {
    BUILD_DATE: JSON.stringify(new Date().valueOf()),
  },
})

export default config
