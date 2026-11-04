import { defineConfig } from 'vitest/config';

// Separate from vite.config.ts: vitest bundles its own Vite, and sharing plugins across the two breaks types.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
