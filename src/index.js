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
        return new Response(JSON.stringify({ 
          status: 'healthy', 
          timestamp: new Date().toISOString(),
          version: '2.0.0',
          features: ['uploads', 'search', 'auth', 'debugging', 'predictions']
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Default response
      return new Response('Scholarphile API v2.0 - Not Found', { 
        status: 404,
        headers: corsHeaders
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error',
        details: env.DEBUG ? error.message : undefined,
        timestamp: new Date().toISOString()
      }), {
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
  const route = path.replace('/api/', '').split('/')[0];
  const subRoute = path.replace('/api/', '').split('/').slice(1);

  switch (route) {
    case 'documents':
      return await handleDocuments(request, env, method, subRoute);
    
    case 'users':
      return await handleUsers(request, env, method, subRoute);
    
    case 'search':
      return await handleSearch(request, env, method, subRoute);
    
    case 'auth':
      return await handleAuth(request, env, method, subRoute);
    
    case 'debug':
      return await handleDebug(request, env, method, subRoute);
    
    case 'predict':
      return await handlePredictions(request, env, method, subRoute);
    
    case 'files':
      return await handleFiles(request, env, method, subRoute);
    
    default:
      return new Response(JSON.stringify({ error: 'Route not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
  }
}

// Document endpoints
async function handleDocuments(request, env, method, subRoute) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  const userId = await getUserIdFromRequest(request, env);

  switch (method) {
    case 'GET':
      if (subRoute[0]) {
        // Get specific document
        const { results } = await env.DB.prepare(
          'SELECT d.*, u.name as user_name FROM documents d LEFT JOIN users u ON d.user_id = u.id WHERE d.id = ?'
        ).bind(subRoute[0]).all();
        
        if (results.length === 0) {
          return new Response(JSON.stringify({ error: 'Document not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Increment view count
        await env.DB.prepare('UPDATE documents SET view_count = view_count + 1 WHERE id = ?')
          .bind(subRoute[0]).run();

        return new Response(JSON.stringify({ document: results[0] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        // Get all documents with pagination
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        const { results } = await env.DB.prepare(`
          SELECT d.*, u.name as user_name 
          FROM documents d 
          LEFT JOIN users u ON d.user_id = u.id 
          ORDER BY d.created_at DESC 
          LIMIT ? OFFSET ?
        `).bind(limit, offset).all();
        
        // Get total count
        const { results: countResults } = await env.DB.prepare('SELECT COUNT(*) as total FROM documents').all();
        const total = countResults[0].total;

        return new Response(JSON.stringify({ 
          documents: results,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

    case 'POST':
      // Upload new document
      const formData = await request.formData();
      const file = formData.get('file');
      const title = formData.get('title');
      const description = formData.get('description');
      const courseCode = formData.get('courseCode');
      const courseName = formData.get('courseName');
      const year = formData.get('year');
      const semester = formData.get('semester');
      const tags = formData.get('tags');

      if (!file || !title) {
        return new Response(JSON.stringify({ error: 'File and title are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Validate file type and size
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        return new Response(JSON.stringify({ error: 'Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        return new Response(JSON.stringify({ error: 'File size must be less than 10MB' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        // Store file in R2
        const fileName = `${Date.now()}-${crypto.randomUUID()}-${file.name}`;
        const fileBuffer = await file.arrayBuffer();
        
        if (env.STORAGE) {
          await env.STORAGE.put(fileName, fileBuffer, {
            customMetadata: {
              originalName: file.name,
              contentType: file.type,
              uploadedBy: userId || 'anonymous'
            }
          });
        }

        // Extract text content for search indexing
        const textContent = await extractTextContent(file, fileBuffer);

        // Generate document ID
        const documentId = crypto.randomUUID();

        // Save metadata to D1
        const { success } = await env.DB.prepare(`
          INSERT INTO documents (id, title, description, file_url, file_size, file_type, course_code, course_name, year, semester, tags, user_id, text_content)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          documentId,
          title,
          description || '',
          fileName,
          file.size,
          file.type,
          courseCode || '',
          courseName || '',
          year ? parseInt(year) : null,
          semester || '',
          tags || '',
          userId || 'anonymous',
          textContent
        ).run();

        if (success) {
          // Log analytics
          await logEvent(env, 'document_upload', { documentId, userId, fileType: file.type });

          return new Response(JSON.stringify({ 
            message: 'Document uploaded successfully',
            documentId,
            fileName
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          return new Response(JSON.stringify({ error: 'Failed to save document metadata' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      } catch (error) {
        console.error('Upload error:', error);
        return new Response(JSON.stringify({ error: 'Upload failed', details: env.DEBUG ? error.message : undefined }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

    case 'DELETE':
      if (!subRoute[0]) {
        return new Response(JSON.stringify({ error: 'Document ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Verify ownership
      const { results: docResults } = await env.DB.prepare('SELECT user_id, file_url FROM documents WHERE id = ?')
        .bind(subRoute[0]).all();
      
      if (docResults.length === 0) {
        return new Response(JSON.stringify({ error: 'Document not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (docResults[0].user_id !== userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Delete from R2
      if (env.STORAGE) {
        await env.STORAGE.delete(docResults[0].file_url);
      }

      // Delete from database
      await env.DB.prepare('DELETE FROM documents WHERE id = ?').bind(subRoute[0]).run();

      return new Response(JSON.stringify({ message: 'Document deleted successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    default:
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
  }
}

// Enhanced search endpoints
async function handleSearch(request, env, method, subRoute) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'GET') {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    const courseCode = url.searchParams.get('course');
    const year = url.searchParams.get('year');
    const type = url.searchParams.get('type');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const userId = await getUserIdFromRequest(request, env);
    
    if (!query) {
      return new Response(JSON.stringify({ error: 'Search query required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Log search for analytics and future predictions
    await logSearch(env, query, userId);

    let searchSql = `
      SELECT d.*, u.name as user_name,
      (CASE 
        WHEN d.title LIKE ? THEN 10
        WHEN d.description LIKE ? THEN 5
        WHEN d.course_code LIKE ? THEN 8
        WHEN d.course_name LIKE ? THEN 6
        WHEN d.text_content LIKE ? THEN 3
        ELSE 1
      END) as relevance_score
      FROM documents d 
      LEFT JOIN users u ON d.user_id = u.id 
      WHERE (d.title LIKE ? OR d.description LIKE ? OR d.course_code LIKE ? OR d.course_name LIKE ? OR d.text_content LIKE ?)
    `;
    
    let params = [];
    const likeQuery = `%${query}%`;
    
    // Add relevance scoring parameters
    for (let i = 0; i < 5; i++) {
      params.push(likeQuery);
    }
    
    // Add search parameters
    for (let i = 0; i < 5; i++) {
      params.push(likeQuery);
    }

    // Add filters
    if (courseCode) {
      searchSql += ' AND d.course_code = ?';
      params.push(courseCode);
    }
    
    if (year) {
      searchSql += ' AND d.year = ?';
      params.push(parseInt(year));
    }
    
    if (type) {
      searchSql += ' AND d.file_type LIKE ?';
      params.push(`%${type}%`);
    }

    searchSql += ' ORDER BY relevance_score DESC, d.view_count DESC, d.created_at DESC';
    searchSql += ' LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const { results } = await env.DB.prepare(searchSql).bind(...params).all();

    // Get search suggestions
    const suggestions = await getSearchSuggestions(env, query);

    return new Response(JSON.stringify({ 
      results,
      suggestions,
      pagination: { page, limit },
      totalResults: results.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Authentication endpoints
async function handleAuth(request, env, method, subRoute) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  switch (subRoute[0]) {
    case 'login':
      if (method === 'POST') {
        const { email, password } = await request.json();
        
        if (!email || !password) {
          return new Response(JSON.stringify({ error: 'Email and password required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Simple authentication (in production, use proper password hashing)
        const { results } = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).all();
        
        if (results.length === 0) {
          return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const user = results[0];
        
        // Generate session token
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await env.DB.prepare(`
          INSERT INTO user_sessions (id, user_id, token, expires_at)
          VALUES (?, ?, ?, ?)
        `).bind(crypto.randomUUID(), user.id, token, expiresAt.toISOString()).run();

        return new Response(JSON.stringify({
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar_url: user.avatar_url
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      break;

    case 'register':
      if (method === 'POST') {
        const { email, password, name } = await request.json();
        
        if (!email || !password || !name) {
          return new Response(JSON.stringify({ error: 'Email, password, and name required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Check if user exists
        const { results: existingUser } = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).all();
        
        if (existingUser.length > 0) {
          return new Response(JSON.stringify({ error: 'User already exists' }), {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Create user
        const userId = crypto.randomUUID();
        await env.DB.prepare(`
          INSERT INTO users (id, email, name, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?)
        `).bind(userId, email, name, new Date().toISOString(), new Date().toISOString()).run();

        // Generate session token
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await env.DB.prepare(`
          INSERT INTO user_sessions (id, user_id, token, expires_at)
          VALUES (?, ?, ?, ?)
        `).bind(crypto.randomUUID(), userId, token, expiresAt.toISOString()).run();

        return new Response(JSON.stringify({
          token,
          user: {
            id: userId,
            email,
            name
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      break;

    case 'me':
      if (method === 'GET') {
        const userId = await getUserIdFromRequest(request, env);
        
        if (!userId) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { results } = await env.DB.prepare('SELECT id, email, name, avatar_url FROM users WHERE id = ?').bind(userId).all();
        
        if (results.length === 0) {
          return new Response(JSON.stringify({ error: 'User not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ user: results[0] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      break;

    case 'logout':
      if (method === 'POST') {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        
        if (token) {
          await env.DB.prepare('DELETE FROM user_sessions WHERE token = ?').bind(token).run();
        }

        return new Response(JSON.stringify({ message: 'Logged out successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      break;
  }

  return new Response(JSON.stringify({ error: 'Invalid auth endpoint' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// File handling endpoints
async function handleFiles(request, env, method, subRoute) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'GET' && subRoute[0]) {
    // Get file from R2
    if (!env.STORAGE) {
      return new Response(JSON.stringify({ error: 'File storage not configured' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const fileKey = subRoute[0];
    const file = await env.STORAGE.get(fileKey);
    
    if (!file) {
      return new Response('File not found', { status: 404 });
    }

    const headers = {
      'Content-Type': file.customMetadata?.contentType || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${file.customMetadata?.originalName || fileKey}"`,
      ...corsHeaders
    };

    return new Response(file.body, { headers });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Debug endpoints
async function handleDebug(request, env, method, subRoute) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'GET') {
    switch (subRoute[0]) {
      case 'stats':
        const stats = await getSystemStats(env);
        return new Response(JSON.stringify(stats), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'health':
        const health = await checkSystemHealth(env);
        return new Response(JSON.stringify(health), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'logs':
        // Return recent system events
        const { results: logs } = await env.DB.prepare(`
          SELECT * FROM system_events 
          ORDER BY created_at DESC 
          LIMIT 100
        `).all();
        
        return new Response(JSON.stringify({ logs }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({ 
          message: 'Debug endpoints available',
          endpoints: ['/stats', '/health', '/logs']
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Prediction endpoints (ML/AI features)
async function handlePredictions(request, env, method, subRoute) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  const userId = await getUserIdFromRequest(request, env);

  if (method === 'GET') {
    switch (subRoute[0]) {
      case 'recommendations':
        const recommendations = await getDocumentRecommendations(env, userId);
        return new Response(JSON.stringify({ recommendations }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'trending':
        const trending = await getTrendingTopics(env);
        return new Response(JSON.stringify({ trending }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'similar':
        const docId = new URL(request.url).searchParams.get('docId');
        if (!docId) {
          return new Response(JSON.stringify({ error: 'Document ID required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const similar = await getSimilarDocuments(env, docId);
        return new Response(JSON.stringify({ similar }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({ 
          message: 'Prediction endpoints available',
          endpoints: ['/recommendations', '/trending', '/similar?docId=']
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Helper function implementations

async function getUserIdFromRequest(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  const { results } = await env.DB.prepare(`
    SELECT user_id FROM user_sessions 
    WHERE token = ? AND expires_at > ?
  `).bind(token, new Date().toISOString()).all();

  return results.length > 0 ? results[0].user_id : null;
}

async function extractTextContent(file, fileBuffer) {
  // Simple text extraction - in production, use more sophisticated libraries
  if (file.type === 'text/plain') {
    return new TextDecoder().decode(fileBuffer);
  }
  
  // For other file types, return metadata for now
  return `File: ${file.name}, Type: ${file.type}, Size: ${file.size}`;
}

async function logEvent(env, eventType, data) {
  try {
    // Create events table if it doesn't exist
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS system_events (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await env.DB.prepare(`
      INSERT INTO system_events (id, event_type, data, created_at)
      VALUES (?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      eventType,
      JSON.stringify(data),
      new Date().toISOString()
    ).run();
  } catch (error) {
    console.error('Failed to log event:', error);
  }
}

async function logSearch(env, query, userId) {
  try {
    await env.DB.prepare(`
      INSERT INTO search_history (id, user_id, query, created_at)
      VALUES (?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      userId,
      query,
      new Date().toISOString()
    ).run();
  } catch (error) {
    console.error('Failed to log search:', error);
  }
}

async function getSearchSuggestions(env, query) {
  try {
    // Get popular search terms
    const { results } = await env.DB.prepare(`
      SELECT query, COUNT(*) as count
      FROM search_history 
      WHERE query LIKE ?
      GROUP BY query
      ORDER BY count DESC
      LIMIT 5
    `).bind(`%${query}%`).all();

    return results.map(r => r.query);
  } catch (error) {
    console.error('Failed to get suggestions:', error);
    return [];
  }
}

async function getSystemStats(env) {
  try {
    const { results: docStats } = await env.DB.prepare('SELECT COUNT(*) as total_documents FROM documents').all();
    const { results: userStats } = await env.DB.prepare('SELECT COUNT(*) as total_users FROM users').all();
    const { results: searchStats } = await env.DB.prepare('SELECT COUNT(*) as total_searches FROM search_history WHERE created_at > ?').bind(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).all();

    return {
      totalDocuments: docStats[0]?.total_documents || 0,
      totalUsers: userStats[0]?.total_users || 0,
      searchesToday: searchStats[0]?.total_searches || 0,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return { error: 'Failed to get stats' };
  }
}

async function checkSystemHealth(env) {
  const checks = {
    database: false,
    storage: false,
    timestamp: new Date().toISOString()
  };

  try {
    // Test database
    await env.DB.prepare('SELECT 1').all();
    checks.database = true;
  } catch (error) {
    checks.databaseError = error.message;
  }

  try {
    // Test storage
    if (env.STORAGE) {
      await env.STORAGE.head('health-check');
      checks.storage = true;
    }
  } catch (error) {
    checks.storageError = error.message;
  }

  return checks;
}

async function getDocumentRecommendations(env, userId) {
  if (!userId) return [];

  try {
    // Simple recommendation based on user's recent activity
    const { results } = await env.DB.prepare(`
      SELECT DISTINCT d.course_code
      FROM documents d
      JOIN search_history sh ON (sh.query LIKE '%' || d.course_code || '%' OR sh.query LIKE '%' || d.title || '%')
      WHERE sh.user_id = ?
      ORDER BY sh.created_at DESC
      LIMIT 3
    `).bind(userId).all();

    const courseCodes = results.map(r => r.course_code).filter(Boolean);
    
    if (courseCodes.length === 0) return [];

    const { results: recommendations } = await env.DB.prepare(`
      SELECT d.*, u.name as user_name
      FROM documents d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.course_code IN (${courseCodes.map(() => '?').join(', ')})
      AND d.user_id != ?
      ORDER BY d.view_count DESC, d.created_at DESC
      LIMIT 10
    `).bind(...courseCodes, userId).all();

    return recommendations;
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    return [];
  }
}

async function getTrendingTopics(env) {
  try {
    const { results } = await env.DB.prepare(`
      SELECT course_code, COUNT(*) as popularity
      FROM documents 
      WHERE created_at > ?
      GROUP BY course_code
      ORDER BY popularity DESC
      LIMIT 10
    `).bind(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()).all();

    return results.filter(r => r.course_code);
  } catch (error) {
    console.error('Failed to get trending topics:', error);
    return [];
  }
}

async function getSimilarDocuments(env, docId) {
  try {
    // Get the reference document
    const { results: refDoc } = await env.DB.prepare(`
      SELECT course_code, tags FROM documents WHERE id = ?
    `).bind(docId).all();

    if (refDoc.length === 0) return [];

    const { course_code, tags } = refDoc[0];

    // Find similar documents based on course code and tags
    const { results } = await env.DB.prepare(`
      SELECT d.*, u.name as user_name
      FROM documents d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE d.id != ? 
      AND (d.course_code = ? OR d.tags LIKE ?)
      ORDER BY 
        CASE WHEN d.course_code = ? THEN 2 ELSE 0 END +
        CASE WHEN d.tags LIKE ? THEN 1 ELSE 0 END DESC,
        d.view_count DESC
      LIMIT 5
    `).bind(docId, course_code, `%${tags}%`, course_code, `%${tags}%`).all();

    return results;
  } catch (error) {
    console.error('Failed to get similar documents:', error);
    return [];
  }
}

async function handleUsers(request, env, method, subRoute) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  const userId = await getUserIdFromRequest(request, env);

  switch (method) {
    case 'GET':
      if (subRoute[0] === 'profile') {
        if (!userId) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Get user info and stats
        const { results: userInfo } = await env.DB.prepare(`
          SELECT id, email, name, avatar_url, created_at FROM users WHERE id = ?
        `).bind(userId).all();

        const { results: userStats } = await env.DB.prepare(`
          SELECT 
            COUNT(*) as documents_count,
            SUM(view_count) as total_views,
            SUM(download_count) as total_downloads
          FROM documents WHERE user_id = ?
        `).bind(userId).all();

        const { results: userDocs } = await env.DB.prepare(`
          SELECT * FROM documents WHERE user_id = ? ORDER BY created_at DESC LIMIT 10
        `).bind(userId).all();

        return new Response(JSON.stringify({
          user: userInfo[0],
          stats: userStats[0],
          recentDocuments: userDocs
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      break;

    default:
      return new Response(JSON.stringify({ message: 'Users endpoint with profile support' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
} 