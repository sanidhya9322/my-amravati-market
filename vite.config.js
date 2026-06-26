import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
        clientsClaim: true,
        skipWaiting: true,
      },
      manifest: {
        name: "MyAmravati Market",
        short_name: "MyAmravati",
        description: "Buy and sell products locally in Amravati District",
        theme_color: "#2563eb",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/logo192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/logo512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),

    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: [
            "react",
            "react-dom",
            "react-router-dom",
          ],
          firebaseCore: [
            "firebase/app",
          ],
          firebaseAuth: [
            "firebase/auth",
          ],
          firebaseFirestore: [
            "firebase/firestore",
          ],
          firebaseStorage: [
            "firebase/storage",
          ],
          firebaseMessaging: [
            "firebase/messaging",
          ],
          motion: [
            "framer-motion",
          ],
          swiper: [
            "swiper",
            "swiper/react",
          ],
        },
      },
    },
  },
});