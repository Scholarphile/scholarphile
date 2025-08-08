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
    courses: [
      { id: 'calc-applied', title: 'Calculus Applied!', provider: 'ScholarphileX', theme: 'math' },
      { id: 'cs50x', title: "CS50's Introduction to Computer Science", provider: 'ScholarphileX', theme: 'cs' },
      { id: 'cs50p', title: "CS50's Introduction to Programming with Python", provider: 'ScholarphileX', theme: 'python' },
      { id: 'calc-applied-2', title: 'Calculus Applied!', provider: 'ScholarphileX', theme: 'math' }
    ],
    recommendedDocuments: [
      { id: 'aw-guide', title: 'Academic Writing Excellence', badge: 'Research Guide', format: 'PDF', pages: 24, updatedAt: Date.now() - 86400000 },
      { id: 'proposal-template', title: 'Research Proposal Template', badge: 'Template', format: 'DOCX', pages: 12, updatedAt: Date.now() - 2*86400000 },
      { id: 'citation-ref', title: 'Citation Style Quick Reference', badge: 'Reference', format: 'PDF', pages: 8, updatedAt: Date.now() - 5*86400000 }
    ]
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


