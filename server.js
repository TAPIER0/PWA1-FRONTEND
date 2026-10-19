const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5500;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const ROOT_DIR = path.resolve(__dirname);
const BLOCKED_FILES = new Set(['server.js', 'package.json', 'package-lock.json']);

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getSecurityHeaders(contentType, isNoStore = false) {
  const headers = {
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net data:; img-src 'self' data: blob: http://localhost:5264 http://localhost:5066 https://localhost:7287 https://*.azurewebsites.net; connect-src 'self' http://localhost:5264 http://localhost:5066 https://localhost:7287 https://*.azurewebsites.net;"
  };
  if (isNoStore) {
    headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';
  }
  return headers;
}

const server = http.createServer((req, res) => {
  let rawPath = '/';
  try {
    rawPath = decodeURIComponent((req.url || '/').split('?')[0]);
  } catch (e) {
    res.writeHead(400, getSecurityHeaders('text/plain; charset=utf-8', true));
    res.end('Solicitud inválida.');
    return;
  }

  if (rawPath === '/' || rawPath === '') rawPath = '/Interfaz_General.html';

  // Normalizar y resolver ruta canónica dentro de ROOT_DIR
  const safeRelative = rawPath.replace(/^[/\\]+/, '');
  const filePath = path.resolve(ROOT_DIR, safeRelative);
  const relativeFromRoot = path.relative(ROOT_DIR, filePath);

  const hasDotSegment = relativeFromRoot.split(path.sep).some(part => part.startsWith('.'));
  const isOutsideRoot = relativeFromRoot.startsWith('..') || path.isAbsolute(relativeFromRoot);
  const isBlockedFile = BLOCKED_FILES.has(path.basename(filePath).toLowerCase());

  if (isOutsideRoot || hasDotSegment || isBlockedFile) {
    res.writeHead(403, getSecurityHeaders('text/plain; charset=utf-8', true));
    res.end('Acceso denegado.');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      const errorPagePath = path.join(ROOT_DIR, 'error.html');
      const safeFileDisplay = escapeHtml(rawPath);
      fs.readFile(errorPagePath, (errErr, errorHtml) => {
        if (!errErr && errorHtml) {
          res.writeHead(404, getSecurityHeaders('text/html; charset=utf-8', true));
          const content = errorHtml.toString().replace('{{RESOURCE_PATH}}', safeFileDisplay);
          res.end(content);
        } else {
          res.writeHead(404, getSecurityHeaders('text/plain; charset=utf-8', true));
          res.end('Archivo no encontrado: ' + safeFileDisplay);
        }
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const headers = getSecurityHeaders(MIME[ext] || 'application/octet-stream', ext === '.html');
    res.writeHead(200, headers);
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend escuchando en http://127.0.0.1:${PORT}/ (Interfaz_General.html)`);
});
