import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for a React + Phaser browser game.
// - React handles UI and visual novel dialogue.
// - Phaser runs inside a canvas managed by the GameCanvas component.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
});
