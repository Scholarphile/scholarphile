import { signJwtHS256 } from '../_utils/jwt.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { email, password, remember } = body || {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: 'Invalid email' }, 400);
    }
    if (!password || password.length < 6) {
      return json({ error: 'Invalid credentials' }, 401);
    }

    const userId = btoa(email).replace(/=+$/g, '');
    const displayName = email.split('@')[0];
    const expSec = Math.floor(Date.now() / 1000) + (remember ? 60 * 60 * 24 * 7 : 60 * 60 * 12);
    const token = await signJwtHS256({ sub: userId, email, displayName, exp: expSec }, env.JWT_SECRET || 'dev_secret');

    return json({
      token,
      user: { id: userId, email, displayName }
    });
  } catch (e) {
    return json({ error: 'Bad request' }, 400);
  }
}

function json(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    },
  });
}


