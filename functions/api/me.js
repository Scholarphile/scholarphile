export async function onRequestGet(context) {
  const { data } = context;
  if (!data || !data.user) {
    return json({ error: 'Unauthorized' }, 401);
  }
  return json({ user: data.user });
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


