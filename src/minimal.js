// Scholarphile Worker (Minimal Core)
// Features: health, list documents, upload, download, direct file serving

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === 'OPTIONS') return new Response(null, { headers: CORS });

    try {
      // Health
      if (path === '/health') {
        return json({ status: 'ok', d1: !!env.DB, r2: !!env.STORAGE }, 200);
      }

      // API routes
      if (path.startsWith('/api/')) {
        const seg = path.replace('/api/', '').split('/');
        const route = seg[0];
        const id = seg[1] || null;

        if (route === 'documents') {
          if (method === 'GET') {
            return id ? getDocument(env, id, url) : listDocuments(env, url);
          }
          if (method === 'POST') {
            return uploadDocument(env, request);
          }
        }

        if (route === 'search' && method === 'GET') {
          return searchDocuments(env, url);
        }

        return json({ error: 'Not found' }, 404);
      }

      // Direct file serving from R2: /files/:key
      if (path.startsWith('/files/')) {
        const key = decodeURIComponent(path.slice('/files/'.length));
        return streamR2(env, key, false);
      }

      return new Response('Not Found', { status: 404, headers: CORS });
    } catch (err) {
      return json({ error: 'Internal Server Error', message: err.message }, 500);
    }
  }
};

async function listDocuments(env, url) {
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '24'), 100);
  const { results } = await env.DB.prepare(
    'SELECT id, title, description, file_url, file_size, file_type, created_at FROM documents ORDER BY created_at DESC LIMIT ?'
  ).bind(limit).all();
  return json({ documents: results });
}

async function getDocument(env, id, url) {
  const doc = await env.DB.prepare(
    'SELECT id, title, description, file_url, file_size, file_type, created_at FROM documents WHERE id = ?'
  ).bind(id).first();
  if (!doc) return json({ error: 'Document not found' }, 404);

  if (url.searchParams.get('download') === '1') {
    const key = extractKey(doc.file_url, url);
    return streamR2(env, key, true, doc.title);
  }
  return json({ document: doc });
}

async function uploadDocument(env, request) {
  const ct = request.headers.get('Content-Type') || '';
  if (!ct.toLowerCase().includes('multipart/form-data')) {
    return json({ error: 'Content-Type must be multipart/form-data' }, 400);
  }
  const form = await request.formData();
  const file = form.get('file');
  const title = (form.get('title') || '').toString().trim();
  const description = (form.get('description') || '').toString();
  if (!file || !title) return json({ error: 'File and title are required' }, 400);

  const buf = await file.arrayBuffer();
  const fileType = file.type || 'application/octet-stream';
  const fileKey = `${Date.now()}-${sanitize(file.name || 'upload')}`;
  await env.STORAGE.put(fileKey, buf, { httpMetadata: { contentType: fileType } });

  const id = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO documents (id, title, description, file_url, file_size, file_type, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, title, description, fileKey, buf.byteLength, fileType, 'anonymous', now(), now()).run();

  // Return fully qualified file URL for convenience
  const origin = new URL(request.url).origin;
  return json({
    message: 'Document uploaded successfully',
    document: {
      id, title, description,
      fileUrl: `${origin}/files/${encodeURIComponent(fileKey)}`,
      fileSize: buf.byteLength,
      fileType
    }
  });
}

async function searchDocuments(env, url) {
  const q = (url.searchParams.get('q') || '').toString().trim();
  if (!q) return json({ results: [] });
  const like = `%${q}%`;
  const { results } = await env.DB.prepare(
    'SELECT id, title, description, file_url, file_size, file_type, created_at FROM documents WHERE title LIKE ? OR description LIKE ? ORDER BY created_at DESC LIMIT 50'
  ).bind(like, like).all();
  return json({ results });
}

function extractKey(fileUrl, requestUrl) {
  try {
    if (!fileUrl) return '';
    if (!/^https?:\/\//i.test(fileUrl)) return fileUrl; // already a key
    const u = new URL(fileUrl);
    const idx = u.pathname.indexOf('/files/');
    return decodeURIComponent(idx >= 0 ? u.pathname.slice(idx + 7) : u.pathname.replace(/^\//, ''));
  } catch { return ''; }
}

async function streamR2(env, key, forceDownload = false, filename = 'document') {
  if (!key) return json({ error: 'File not found' }, 404);
  const obj = await env.STORAGE.get(key);
  if (!obj) return json({ error: 'File not found' }, 404);
  const headers = new Headers(CORS);
  obj.writeHttpMetadata(headers);
  if (!headers.get('Content-Type')) headers.set('Content-Type', obj.httpMetadata?.contentType || 'application/octet-stream');
  if (forceDownload) {
    headers.set('Content-Disposition', `attachment; filename="${sanitize(filename)}"`);
    headers.append('Access-Control-Expose-Headers', 'Content-Disposition');
  }
  return new Response(obj.body, { headers });
}

function now() { return new Date().toISOString(); }
function sanitize(s) { return (s || '').toString().replace(/[^\w\-. ]+/g, '_'); }

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}

