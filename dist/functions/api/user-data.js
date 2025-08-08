export async function onRequestGet(context) {
  const { data } = context;
  if (!data || !data.user) {
    return json({ error: 'Unauthorized' }, 401);
  }

  // Simulated user data store; replace later with real DB
  const response = {
    userId: data.user.id,
    email: data.user.email,
    displayName: data.user.displayName,
    plan: 'free',
    lastLoginAt: Date.now(),
  };

  // Cache for 60s at edge/CDN level
  return json(response, 200, {
    'Cache-Control': 'private, max-age=60',
  });
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


