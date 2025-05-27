import { defineConfig } from 'vite'
import react  from '@vitejs/plugin-react'
export default defineConfig({
  build: {
    outDir: 'dist',
  },
  plugins: [react()],
  base: '/',
  // server: {
  //   proxy: {
  //     '/socket.io': {
  //       target: 'http://localhost:3000',
  //       ws: true,
  //       rewriteWsOrigin: true
  //     }
  //   }
  // }
})