import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig } from "vite";

// HTTPS is required for getUserMedia (mic) to work on non-localhost origins,
// e.g. when testing on a phone over the LAN with `--host`. We serve the app
// over HTTPS and proxy the API + Socket.IO to the backend so there's a single
// origin (one self-signed cert to trust) and no mixed-content blocking.
export default defineConfig({
  plugins: [basicSsl()],
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:3000",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
