import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function apiPlugin() {
  return {
    name: 'api-handler',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res) => {
        let body = '';
        for await (const chunk of req) body += chunk;

        try {
          req.body = body ? JSON.parse(body) : {};
        } catch {
          req.body = {};
        }

        res.status = (code) => { res.statusCode = code; return res; };
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };

        const { default: handler } = await import('./api/store.js');

        try {
          await handler(req, res);
        } catch (err) {
          console.error('API handler error:', err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), apiPlugin()],
})
