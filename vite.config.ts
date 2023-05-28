import react from '@vitejs/plugin-react';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    exclude: [...configDefaults.exclude],
    coverage: {
      enabled: true,
      all: true,
      exclude: [
        '*.d.ts',
        '*.config.ts',
        '.next/**',
        '**/prisma.ts',
        'middleware.ts',
      ],
      excludeNodeModules: true,
      extension: ['.ts'],
    },
  },
});
