// Main Cloudflare Worker for Scholarphile API
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // API routes
      if (path.startsWith('/api/')) {
        return await handleAPI(request, env, path, method);
      }

      // Health check
      if (path === '/health') {
        return new Response(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Default response
      return new Response('Scholarphile API - Not Found', { 
        status: 404,
        headers: corsHeaders
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

// API route handler
async function handleAPI(request, env, path, method) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Extract route from path
  const route = path.replace('/api/', '');

  switch (route) {
    case 'documents':
      return await handleDocuments(request, env, method);
    
    case 'users':
      return await handleUsers(request, env, method);
    
    case 'search':
      return await handleSearch(request, env, method);
    
    case 'auth':
      return await handleAuth(request, env, method);
    
    default:
      return new Response(JSON.stringify({ error: 'Route not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
  }
}

// Document endpoints
async function handleDocuments(request, env, method) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  switch (method) {
    case 'GET':
      // Get all documents
      const { results } = await env.DB.prepare(
        'SELECT * FROM documents ORDER BY created_at DESC LIMIT 50'
      ).all();
      
      return new Response(JSON.stringify({ documents: results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    case 'POST':
      // Upload new document
      const formData = await request.formData();
      const file = formData.get('file');
      const title = formData.get('title');
      const description = formData.get('description');
      const courseCode = formData.get('courseCode');
      const year = formData.get('year');

      if (!file || !title) {
        return new Response(JSON.stringify({ error: 'File and title are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Store file in R2 (temporarily disabled until R2 is enabled)
      const fileName = `${Date.now()}-${file.name}`;
      // await env.STORAGE.put(fileName, file.stream());
      console.log('File upload temporarily disabled - R2 not configured');

      // Save metadata to D1
      const { success } = await env.DB.prepare(`
        INSERT INTO documents (id, title, description, file_url, course_code, year, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        crypto.randomUUID(),
        title,
        description || '',
        fileName,
        courseCode || '',
        year ? parseInt(year) : null,
        'temp-user-id' // TODO: Get from auth
      ).run();

      if (success) {
        return new Response(JSON.stringify({ message: 'Document uploaded successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ error: 'Failed to save document' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

    default:
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
  }
}

// User endpoints
async function handleUsers(request, env, method) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  return new Response(JSON.stringify({ message: 'Users endpoint - coming soon' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Search endpoints
async function handleSearch(request, env, method) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'GET') {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    
    if (!query) {
      return new Response(JSON.stringify({ error: 'Search query required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Simple search implementation
    const { results } = await env.DB.prepare(`
      SELECT * FROM documents 
      WHERE title LIKE ? OR description LIKE ? OR course_code LIKE ?
      ORDER BY created_at DESC
    `).bind(`%${query}%`, `%${query}%`, `%${query}%`).all();

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Auth endpoints
async function handleAuth(request, env, method) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  return new Response(JSON.stringify({ message: 'Auth endpoint - coming soon' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
} 