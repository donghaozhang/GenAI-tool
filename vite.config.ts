import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Forward API and websocket traffic to Jaaz Python backend (FastAPI)
      "/socket.io": {
        target: "http://127.0.0.1:57988",
        ws: true,
      },
      "/api": {
        target: "http://127.0.0.1:57988",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Ensure single instances of important libs to avoid duplicate React and Three warnings
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(__dirname, "./node_modules/react/jsx-runtime"),
      "react/jsx-dev-runtime": path.resolve(__dirname, "./node_modules/react/jsx-dev-runtime"),
      three: path.resolve(__dirname, "./node_modules/three"),
      zustand: path.resolve(__dirname, "./node_modules/zustand"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "three", "zustand"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "zustand"],
    force: true,
  },
}));
