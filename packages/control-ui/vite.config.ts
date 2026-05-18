import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:18700",
      "/gateway": "http://127.0.0.1:18700",
      "/health": "http://127.0.0.1:18700",
      "/status": "http://127.0.0.1:18700",
    },
  },
});