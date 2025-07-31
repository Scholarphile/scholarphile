// Generate UUID function
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
    
    case 'documents/view':
      return await handleDocumentView(request, env, method);
    
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
      try {
        // Upload new document
        const formData = await request.formData();
        const file = formData.get('file');
        const title = formData.get('title');
        const description = formData.get('description');
        const courseCode = formData.get('courseCode');
        const year = formData.get('year');

        console.log('Received upload request:', { title, description, courseCode, year });

        if (!file || !title) {
          return new Response(JSON.stringify({ error: 'File and title are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        console.log('File details:', { name: file.name, size: file.size, type: file.type });

        // Store file in R2
        const fileName = `${Date.now()}-${file.name}`;
        await env.STORAGE.put(fileName, file.stream());
        console.log('File uploaded to R2:', fileName);

        // Create a temporary user if it doesn't exist
        const tempUserId = 'temp-user-id';
        try {
          await env.DB.prepare(`
            INSERT OR IGNORE INTO users (id, email, name)
            VALUES (?, ?, ?)
          `).bind(tempUserId, 'temp@example.com', 'Temporary User').run();
        } catch (userError) {
          console.log('User creation skipped:', userError.message);
        }

        // Save metadata to D1
        const documentId = generateUUID();
        const { success } = await env.DB.prepare(`
          INSERT INTO documents (id, title, description, file_url, file_size, file_type, course_code, year, user_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          documentId,
          title,
          description || '',
          fileName,
          file.size,
          file.type || 'application/octet-stream',
          courseCode || '',
          year ? parseInt(year) : null,
          tempUserId // TODO: Get from auth
        ).run();

        console.log('Database insert result:', { success, documentId });

        if (success) {
          return new Response(JSON.stringify({ 
            message: 'Document uploaded successfully',
            documentId: documentId,
            fileName: fileName
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          return new Response(JSON.stringify({ error: 'Failed to save document' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      } catch (error) {
        console.error('Upload error:', error);
        return new Response(JSON.stringify({ 
          error: 'Upload failed', 
          details: error.message 
        }), {
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

// Document viewing endpoint
async function handleDocumentView(request, env, method) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'GET') {
    const url = new URL(request.url);
    const documentId = url.searchParams.get('id');
    
    if (!documentId) {
      return new Response(JSON.stringify({ error: 'Document ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      // Get document metadata from database
      const { results } = await env.DB.prepare(`
        SELECT * FROM documents WHERE id = ?
      `).bind(documentId).all();

      if (results.length === 0) {
        return new Response(JSON.stringify({ error: 'Document not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const document = results[0];
      
      // Get file from R2
      const file = await env.STORAGE.get(document.file_url);
      
      if (!file) {
        return new Response(JSON.stringify({ error: 'File not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Update view count
      await env.DB.prepare(`
        UPDATE documents SET view_count = view_count + 1 WHERE id = ?
      `).bind(documentId).run();

      // Return file with appropriate headers
      const headers = {
        ...corsHeaders,
        'Content-Type': document.file_type || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${document.title}"`,
        'Cache-Control': 'public, max-age=3600'
      };

      return new Response(file.body, { headers });
    } catch (error) {
      console.error('Document view error:', error);
      return new Response(JSON.stringify({ error: 'Failed to load document' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
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

  if (method === 'POST') {
    try {
      const { action, token } = await request.json();
      
      if (action === 'google-signin') {
        return await handleGoogleSignIn(token, env, corsHeaders);
      } else if (action === 'signout') {
        return await handleSignOut(request, env, corsHeaders);
      } else {
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Handle Google Sign-In
async function handleGoogleSignIn(token, env, corsHeaders) {
  try {
    console.log('Received token:', token.substring(0, 20) + '...');
    
    // Verify Google token
    const googleUser = await verifyGoogleToken(token);
    
    if (!googleUser) {
      console.error('Token verification failed');
      return new Response(JSON.stringify({ error: 'Invalid Google token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log('Token verified, user:', googleUser.email);

    // Check if user exists, create if not
    let user = await getUserByEmail(googleUser.email, env);
    
    if (!user) {
      user = await createUser(googleUser, env);
    } else {
      // Update last login
      await updateUserLastLogin(user.id, env);
    }

    // Create session
    const sessionToken = generateUUID();
    await createUserSession(user.id, sessionToken, env);

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url
      },
      sessionToken: sessionToken
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Google sign-in error:', error);
    return new Response(JSON.stringify({ error: 'Sign-in failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Verify Google token
async function verifyGoogleToken(token) {
  try {
    // Try to verify as ID token first
    let response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    
    if (response.ok) {
      const data = await response.json();
      return {
        email: data.email,
        name: data.name,
        picture: data.picture,
        sub: data.sub
      };
    }
    
    // If ID token fails, try as access token
    response = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${token}`);
    
    if (response.ok) {
      const data = await response.json();
      return {
        email: data.email,
        name: data.name,
        picture: data.picture,
        sub: data.sub
      };
    }
    
    // If both fail, try to decode the token (for development)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        sub: payload.sub
      };
    } catch (decodeError) {
      console.error('Token decode error:', decodeError);
    }
    
    return null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Get user by email
async function getUserByEmail(email, env) {
  const { results } = await env.DB.prepare(`
    SELECT * FROM users WHERE email = ?
  `).bind(email).all();
  
  return results.length > 0 ? results[0] : null;
}

// Create new user
async function createUser(googleUser, env) {
  const userId = generateUUID();
  
  await env.DB.prepare(`
    INSERT INTO users (id, email, name, avatar_url)
    VALUES (?, ?, ?, ?)
  `).bind(
    userId,
    googleUser.email,
    googleUser.name,
    googleUser.picture
  ).run();

  return {
    id: userId,
    email: googleUser.email,
    name: googleUser.name,
    avatar_url: googleUser.picture
  };
}

// Update user last login
async function updateUserLastLogin(userId, env) {
  await env.DB.prepare(`
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(userId).run();
}

// Create user session
async function createUserSession(userId, sessionToken, env) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  await env.DB.prepare(`
    INSERT INTO user_sessions (id, user_id, token, expires_at)
    VALUES (?, ?, ?, ?)
  `).bind(
    generateUUID(),
    userId,
    sessionToken,
    expiresAt.toISOString()
  ).run();
}

// Handle sign out
async function handleSignOut(request, env, corsHeaders) {
  try {
    const { sessionToken } = await request.json();
    
    if (sessionToken) {
      await env.DB.prepare(`
        DELETE FROM user_sessions WHERE token = ?
      `).bind(sessionToken).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Sign-out error:', error);
    return new Response(JSON.stringify({ error: 'Sign-out failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
} 