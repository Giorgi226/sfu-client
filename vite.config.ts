import { defineConfig } from 'vite'
import react  from '@vitejs/plugin-react'
import * as path from 'path'
export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        lobby: path.resolve(__dirname, 'lobby.html'),
      },
    }
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

function resolve(__dirname: string, arg1: string): string {
  throw new Error('Function not implemented.')
}
