import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

function geminiProxyPlugin(apiKey: string): Plugin {
  const handler = async (req: any, res: any) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk;
    });
    req.on('end', async () => {
      try {
        if (!apiKey) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: { message: 'GEMINI_API_KEY tidak dikonfigurasi di server (.env)' } }));
          return;
        }
        const { contents, generationConfig, model = 'gemini-2.5-flash' } = JSON.parse(body || '{}');
        let targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        let apiRes = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents, generationConfig }),
        });
        let data = await apiRes.json();

        // Fallback otomatis ke gemini-flash-latest jika model spesifik belum aktif/limit
        if (apiRes.status === 404 || data.error?.message?.includes('not found')) {
          targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
          apiRes = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents, generationConfig }),
          });
          data = await apiRes.json();
        }

        res.statusCode = apiRes.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
      } catch (err: any) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: { message: err?.message || 'Server proxy error' } }));
      }
    });
  };

  return {
    name: 'gemini-proxy-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split('?')[0];
        if (pathname === '/api/gemini') {
          handler(req, res);
        } else {
          next();
        }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split('?')[0];
        if (pathname === '/api/gemini') {
          handler(req, res);
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const geminiApiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

  return {
    plugins: [
      react(),
      tailwindcss(),
      geminiProxyPlugin(geminiApiKey),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['apple-touch-icon.png', 'icon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          id: '/',
          name: 'Gasem Raya RT 02 - Sistem Administrasi & Kas RT',
          short_name: 'GasemRaya02',
          description: 'Aplikasi Sistem Informasi & Administrasi Warga RT 02 Gasem Raya',
          theme_color: '#2a1309',
          background_color: '#2a1309',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    define: {
      'import.meta.env.SUPABASE_URL': JSON.stringify(
        env.SUPABASE_URL || env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
      ),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
        env.SUPABASE_URL || env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
      ),
      'import.meta.env.SUPABASE_ANON_KEY': JSON.stringify(
        env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
      ),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(
        env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
      ),
      'import.meta.env.GOOGLE_CLIENT_ID': JSON.stringify(
        env.GOOGLE_CLIENT_ID || env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || ''
      ),
      'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(
        env.GOOGLE_CLIENT_ID || env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || ''
      ),
      'import.meta.env.GOOGLE_API_KEY': JSON.stringify(
        env.GOOGLE_API_KEY || env.VITE_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY || ''
      ),
      'import.meta.env.VITE_GOOGLE_API_KEY': JSON.stringify(
        env.GOOGLE_API_KEY || env.VITE_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY || ''
      ),
      'import.meta.env.GOOGLE_DRIVE_FOLDER_ID': JSON.stringify(
        env.GOOGLE_DRIVE_FOLDER_ID || env.VITE_GOOGLE_DRIVE_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID || ''
      ),
      'import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID': JSON.stringify(
        env.GOOGLE_DRIVE_FOLDER_ID || env.VITE_GOOGLE_DRIVE_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID || ''
      ),
      'import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL': JSON.stringify(
        env.GOOGLE_SERVICE_ACCOUNT_EMAIL || env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || ''
      ),
      'import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL': JSON.stringify(
        env.GOOGLE_SERVICE_ACCOUNT_EMAIL || env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || ''
      ),
      'import.meta.env.APP_URL': JSON.stringify(
        env.APP_URL || env.VITE_APP_URL || process.env.APP_URL || ''
      ),
      'import.meta.env.VITE_APP_URL': JSON.stringify(
        env.APP_URL || env.VITE_APP_URL || process.env.APP_URL || ''
      ),
      'import.meta.env.GEMINI_API_KEY': JSON.stringify(
        env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || ''
      ),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(
        env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || ''
      ),
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-icons': ['lucide-react'],
            'vendor-supabase': ['@supabase/supabase-js'],
          },
        },
      },
    },
  };
});
