import { defineConfig } from 'vite';

export default defineConfig({
    base: '/web-chess/', // Assuming repository name is 'web-chess'
    build: {
        outDir: 'dist',
    }
});
