import http from 'http';
import handler from './api/store.js';

const PORT = 3001;

function parseBody(req) {
  return new Promise((resolve) => {
    if (req.method === 'GET' || req.method === 'OPTIONS') {
      resolve();
      return;
    }
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch {
        req.body = {};
      }
      resolve();
    });
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  await parseBody(req);

  res.status = (code) => {
    res.statusCode = code;
    return res;
  };

  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  try {
    await handler(req, res);
  } catch (err) {
    console.error('Handler crashed:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Handler crashed', details: err.message }));
    }
  }
});

server.listen(PORT, () => {
  console.log(`Dev API server running on http://localhost:${PORT}`);
});
