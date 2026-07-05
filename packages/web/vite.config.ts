import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@cadence-runner/shared": path.resolve(__dirname, "../shared/src/index.ts"),
    },
  },
  server: {
    host: true, // 실기기에서 LAN IP로 접근 가능하게
  },
})
