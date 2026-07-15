import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Honor the port assigned by the harness (PORT env); fall back to Vite default.
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
    open: false,
    // Proxy API/Canvas calls to the local Express server (run separately via
    // `npm run dev:server`) so `npm run dev` gives hot-reload UI iteration
    // without needing `vite build` + `npm start` for every frontend change.
    proxy: {
      "/api": "http://localhost:3000",
      "/canvas": "http://localhost:3000",
    },
  },
});
