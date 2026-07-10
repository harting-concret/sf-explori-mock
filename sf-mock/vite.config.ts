import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Honor the port assigned by the harness (PORT env); fall back to Vite default.
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
    open: false,
  },
});
