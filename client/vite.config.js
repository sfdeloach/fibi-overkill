import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import env from "../environment.js";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: env.CLIENT_PORT,
  },
  plugins: [react()],
});
