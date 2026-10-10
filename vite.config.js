import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    base: "./", // Ensures relative paths in production build
    build: {
        outDir: "dist", // Where the build files go
    },
});
