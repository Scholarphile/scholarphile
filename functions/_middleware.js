// Global middleware for Pages Functions
// - Adds CORS for API routes
// - Parses Authorization Bearer token and attaches user to the request

import { verifyJwtHS256 } from './_utils/jwt.js';

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  // CORS for API routes under /api/
  if (url.pathname.startsWith('/api/')) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request),
      });
    }
  }

  // Attach user if token present
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  let user = null;
  if (token && env.JWT_SECRET) {
    const decoded = await verifyJwtHS256(token, env.JWT_SECRET);
    if (decoded && decoded.sub) {
      user = { id: decoded.sub, email: decoded.email, displayName: decoded.displayName };
    }
  }

  context.data = { user };

  const res = await next();
  if (url.pathname.startsWith('/api/')) {
    // Add CORS to API responses
    const headers = new Headers(res.headers);
    const ch = corsHeaders(request);
    ch.forEach((v, k) => headers.set(k, v));
    return new Response(res.body, { status: res.status, headers });
  }
  return res;
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '*';
  return new Headers({
    'Access-Control-Allow-Origin': origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  });
}


