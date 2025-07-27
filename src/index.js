// Enhanced Cloudflare Worker for Scholarphile API with comprehensive functionality
import { sign, verify } from 'jsonwebtoken';

// Constants
const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Enhanced CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Debug-Mode',
      'Access-Control-Expose-Headers': 'X-Debug-Info, X-Request-Id',
    };

    // Generate request ID for debugging
    const requestId = crypto.randomUUID();
    const debugMode = request.headers.get('X-Debug-Mode') === 'true';

    // Debug logging helper
    const debugLog = (message, data = null) => {
      if (debugMode) {
        console.log(`[${requestId}] ${message}`, data || '');
      }
    };

    debugLog('Request received', { method, path, headers: Object.fromEntries(request.headers) });

    // Handle preflight requests
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Add request timing
      const startTime = Date.now();

      let response;

      // API routes
      if (path.startsWith('/api/')) {
        response = await handleAPI(request, env, path, method, debugLog, requestId);
      }
      // Health check with enhanced info
      else if (path === '/health') {
        const healthInfo = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '2.0.0',
          environment: env.ENVIRONMENT || 'development',
          requestId,
          databases: {
            d1: !!env.DB,
            r2: !!env.STORAGE,
          }
        };
        response = new Response(JSON.stringify(healthInfo), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      // Debug endpoint
      else if (path === '/debug' && debugMode) {
        const debugInfo = {
          environment: env.ENVIRONMENT || 'development',
          timestamp: new Date().toISOString(),
          requestId,
          headers: Object.fromEntries(request.headers),
          cf: request.cf,
          url: request.url,
        };
        response = new Response(JSON.stringify(debugInfo, null, 2), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      // Default response
      else {
        response = new Response('Scholarphile API - Not Found', { 
          status: 404,
          headers: corsHeaders
        });
      }

      // Add debug headers
      const endTime = Date.now();
      if (debugMode) {
        response.headers.set('X-Debug-Info', JSON.stringify({
          requestId,
          duration: `${endTime - startTime}ms`,
          timestamp: new Date().toISOString()
        }));
        response.headers.set('X-Request-Id', requestId);
      }

      debugLog('Response sent', { status: response.status, duration: `${endTime - startTime}ms` });
      return response;

    } catch (error) {
      debugLog('Worker error', { error: error.message, stack: error.stack });
      console.error('Worker error:', error);
      
      const errorResponse = {
        error: 'Internal Server Error',
        message: debugMode ? error.message : 'An error occurred',
        requestId,
        timestamp: new Date().toISOString()
      };

      if (debugMode) {
        errorResponse.stack = error.stack;
      }

      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Request-Id': requestId
        }
      });
    }
  }
};

// Enhanced API route handler
async function handleAPI(request, env, path, method, debugLog, requestId) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Debug-Mode',
  };

  // Extract route from path
  const routeParts = path.replace('/api/', '').split('/');
  const route = routeParts[0];
  const subRoute = routeParts[1];

  debugLog('API route', { route, subRoute, method });

  switch (route) {
    case 'auth':
      return await handleAuth(request, env, method, subRoute, debugLog);
    
    case 'documents':
      return await handleDocuments(request, env, method, subRoute, debugLog);
    
    case 'users':
      return await handleUsers(request, env, method, subRoute, debugLog);
    
    case 'search':
      return await handleSearch(request, env, method, debugLog);
    
    case 'recommendations':
      return await handleRecommendations(request, env, method, debugLog);
    
    case 'analytics':
      return await handleAnalytics(request, env, method, debugLog);
    
    case 'upload':
      return await handleUpload(request, env, method, debugLog);
    
    default:
      return new Response(JSON.stringify({ 
        error: 'Route not found', 
        availableRoutes: ['auth', 'documents', 'users', 'search', 'recommendations', 'analytics', 'upload'],
        requestId 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
  }
}

// Authentication helper
async function authenticateUser(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    // Check if token exists in database and is valid
    const session = await env.DB.prepare(
      'SELECT s.*, u.* FROM user_sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > ?'
    ).bind(token, new Date().toISOString()).first();

    return session;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// Enhanced Authentication endpoints
async function handleAuth(request, env, method, subRoute, debugLog) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  debugLog('Auth handler', { method, subRoute });

  switch (subRoute) {
    case 'register':
      if (method === 'POST') {
        const { email, name, password } = await request.json();
        
        if (!email || !name || !password) {
          return new Response(JSON.stringify({ error: 'Email, name, and password are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Check if user already exists
        const existingUser = await env.DB.prepare(
          'SELECT id FROM users WHERE email = ?'
        ).bind(email).first();

        if (existingUser) {
          return new Response(JSON.stringify({ error: 'User already exists' }), {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Create user (in production, hash the password properly)
        const userId = crypto.randomUUID();
        const passwordHash = await hashPassword(password); // Simple hash for demo

        const { success } = await env.DB.prepare(`
          INSERT INTO users (id, email, name, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?)
        `).bind(userId, email, name, new Date().toISOString(), new Date().toISOString()).run();

        if (success) {
          // Create session
          const token = crypto.randomUUID();
          const expiresAt = new Date(Date.now() + SESSION_DURATION).toISOString();

          await env.DB.prepare(`
            INSERT INTO user_sessions (id, user_id, token, expires_at)
            VALUES (?, ?, ?, ?)
          `).bind(crypto.randomUUID(), userId, token, expiresAt).run();

          debugLog('User registered', { userId, email });

          return new Response(JSON.stringify({
            message: 'User registered successfully',
            user: { id: userId, email, name },
            token,
            expiresAt
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
      break;

    case 'login':
      if (method === 'POST') {
        const { email, password } = await request.json();
        
        if (!email || !password) {
          return new Response(JSON.stringify({ error: 'Email and password are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Find user (in production, verify password hash)
        const user = await env.DB.prepare(
          'SELECT * FROM users WHERE email = ?'
        ).bind(email).first();

        if (!user) {
          return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Create session
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + SESSION_DURATION).toISOString();

        await env.DB.prepare(`
          INSERT INTO user_sessions (id, user_id, token, expires_at)
          VALUES (?, ?, ?, ?)
        `).bind(crypto.randomUUID(), user.id, token, expiresAt).run();

        debugLog('User logged in', { userId: user.id, email });

        return new Response(JSON.stringify({
          message: 'Login successful',
          user: { id: user.id, email: user.email, name: user.name },
          token,
          expiresAt
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      break;

    case 'logout':
      if (method === 'POST') {
        const user = await authenticateUser(request, env);
        if (!user) {
          return new Response(JSON.stringify({ error: 'Not authenticated' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Delete session
        await env.DB.prepare(
          'DELETE FROM user_sessions WHERE token = ?'
        ).bind(request.headers.get('Authorization').substring(7)).run();

        debugLog('User logged out', { userId: user.id });

        return new Response(JSON.stringify({ message: 'Logout successful' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      break;

    case 'me':
      if (method === 'GET') {
        const user = await authenticateUser(request, env);
        if (!user) {
          return new Response(JSON.stringify({ error: 'Not authenticated' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar_url: user.avatar_url,
            created_at: user.created_at
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      break;
  }

  return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Enhanced Document endpoints with file processing
async function handleDocuments(request, env, method, subRoute, debugLog) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  debugLog('Documents handler', { method, subRoute });

  switch (method) {
    case 'GET':
      if (subRoute) {
        // Get specific document
        const document = await env.DB.prepare(
          'SELECT d.*, u.name as author_name FROM documents d JOIN users u ON d.user_id = u.id WHERE d.id = ?'
        ).bind(subRoute).first();

        if (!document) {
          return new Response(JSON.stringify({ error: 'Document not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Increment view count
        await env.DB.prepare(
          'UPDATE documents SET view_count = view_count + 1 WHERE id = ?'
        ).bind(subRoute).run();

        return new Response(JSON.stringify({ document }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        // Get all documents with pagination and filters
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const courseCode = url.searchParams.get('course');
        const year = url.searchParams.get('year');
        const sortBy = url.searchParams.get('sort') || 'created_at';
        const order = url.searchParams.get('order') || 'DESC';
        const offset = (page - 1) * limit;

        let query = `
          SELECT d.*, u.name as author_name 
          FROM documents d 
          JOIN users u ON d.user_id = u.id 
          WHERE 1=1
        `;
        let params = [];

        if (courseCode) {
          query += ' AND d.course_code = ?';
          params.push(courseCode);
        }

        if (year) {
          query += ' AND d.year = ?';
          params.push(parseInt(year));
        }

        query += ` ORDER BY d.${sortBy} ${order} LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const { results } = await env.DB.prepare(query).bind(...params).all();
        
        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM documents WHERE 1=1';
        let countParams = [];
        
        if (courseCode) {
          countQuery += ' AND course_code = ?';
          countParams.push(courseCode);
        }
        
        if (year) {
          countQuery += ' AND year = ?';
          countParams.push(parseInt(year));
        }

        const { total } = await env.DB.prepare(countQuery).bind(...countParams).first();

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
      const user = await authenticateUser(request, env);
      if (!user) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

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

      // Process file
      const fileBuffer = await file.arrayBuffer();
      const fileName = `${Date.now()}-${file.name}`;
      const fileSize = fileBuffer.byteLength;
      const fileType = file.type;

      debugLog('Processing file upload', { fileName, fileSize, fileType });

      // Store file in R2 if available
      let fileUrl = fileName;
      if (env.STORAGE) {
        try {
          await env.STORAGE.put(fileName, fileBuffer);
          fileUrl = `https://your-domain.com/files/${fileName}`;
          debugLog('File uploaded to R2', { fileName });
        } catch (error) {
          debugLog('R2 upload failed', { error: error.message });
        }
      }

      // Extract text content for search indexing (basic implementation)
      let extractedText = '';
      if (fileType === 'text/plain') {
        extractedText = new TextDecoder().decode(fileBuffer);
      }

      // Save metadata to D1
      const documentId = crypto.randomUUID();
      const { success } = await env.DB.prepare(`
        INSERT INTO documents (
          id, title, description, file_url, file_size, file_type,
          course_code, course_name, year, semester, tags, user_id,
          created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        documentId, title, description || '', fileUrl, fileSize, fileType,
        courseCode || '', courseName || '', year ? parseInt(year) : null,
        semester || '', tags || '[]', user.id,
        new Date().toISOString(), new Date().toISOString()
      ).run();

      if (success) {
        debugLog('Document saved to database', { documentId, title });

        return new Response(JSON.stringify({
          message: 'Document uploaded successfully',
          document: {
            id: documentId,
            title,
            fileUrl,
            fileSize,
            fileType
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ error: 'Failed to save document' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

    case 'DELETE':
      if (!subRoute) {
        return new Response(JSON.stringify({ error: 'Document ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const deleteUser = await authenticateUser(request, env);
      if (!deleteUser) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Check if user owns the document
      const docToDelete = await env.DB.prepare(
        'SELECT * FROM documents WHERE id = ? AND user_id = ?'
      ).bind(subRoute, deleteUser.id).first();

      if (!docToDelete) {
        return new Response(JSON.stringify({ error: 'Document not found or access denied' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Delete from R2 if available
      if (env.STORAGE && docToDelete.file_url) {
        try {
          await env.STORAGE.delete(docToDelete.file_url);
        } catch (error) {
          debugLog('R2 delete failed', { error: error.message });
        }
      }

      // Delete from database
      await env.DB.prepare('DELETE FROM documents WHERE id = ?').bind(subRoute).run();

      debugLog('Document deleted', { documentId: subRoute });

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

// Enhanced Search with recommendations
async function handleSearch(request, env, method, debugLog) {
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
    const fileType = url.searchParams.get('type');
    
    if (!query) {
      return new Response(JSON.stringify({ error: 'Search query required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    debugLog('Search query', { query, courseCode, year, fileType });

    // Log search for analytics
    const user = await authenticateUser(request, env);
    if (user) {
      await env.DB.prepare(`
        INSERT INTO search_history (id, user_id, query, created_at)
        VALUES (?, ?, ?, ?)
      `).bind(crypto.randomUUID(), user.id, query, new Date().toISOString()).run();
    }

    // Enhanced search with multiple criteria
    let searchQuery = `
      SELECT d.*, u.name as author_name,
             (CASE 
               WHEN d.title LIKE ? THEN 10
               WHEN d.description LIKE ? THEN 5
               WHEN d.course_code LIKE ? THEN 3
               WHEN d.tags LIKE ? THEN 2
               ELSE 1
             END) as relevance_score
      FROM documents d 
      JOIN users u ON d.user_id = u.id 
      WHERE (d.title LIKE ? OR d.description LIKE ? OR d.course_code LIKE ? OR d.tags LIKE ?)
    `;
    
    const searchTerm = `%${query}%`;
    let params = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];

    if (courseCode) {
      searchQuery += ' AND d.course_code = ?';
      params.push(courseCode);
    }

    if (year) {
      searchQuery += ' AND d.year = ?';
      params.push(parseInt(year));
    }

    if (fileType) {
      searchQuery += ' AND d.file_type LIKE ?';
      params.push(`%${fileType}%`);
    }

    searchQuery += ' ORDER BY relevance_score DESC, d.view_count DESC, d.created_at DESC LIMIT 50';

    const { results } = await env.DB.prepare(searchQuery).bind(...params).all();

    // Update results count in search history
    if (user) {
      await env.DB.prepare(
        'UPDATE search_history SET results_count = ? WHERE user_id = ? AND query = ? ORDER BY created_at DESC LIMIT 1'
      ).bind(results.length, user.id, query).run();
    }

    debugLog('Search results', { count: results.length });

    return new Response(JSON.stringify({
      results,
      query,
      total: results.length,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Predictive Algorithm - Recommendations
async function handleRecommendations(request, env, method, debugLog) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'GET') {
    const user = await authenticateUser(request, env);
    if (!user) {
      // Provide generic recommendations for unauthenticated users
      const { results } = await env.DB.prepare(`
        SELECT d.*, u.name as author_name 
        FROM documents d 
        JOIN users u ON d.user_id = u.id 
        ORDER BY d.view_count DESC, d.download_count DESC 
        LIMIT 10
      `).all();

      return new Response(JSON.stringify({
        recommendations: results,
        algorithm: 'popularity-based',
        authenticated: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    debugLog('Generating recommendations', { userId: user.id });

    // Get user's search history and favorites
    const searchHistory = await env.DB.prepare(
      'SELECT query FROM search_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 10'
    ).bind(user.id).all();

    const favorites = await env.DB.prepare(
      'SELECT d.course_code, d.year FROM user_favorites f JOIN documents d ON f.document_id = d.id WHERE f.user_id = ?'
    ).bind(user.id).all();

    // Content-based filtering: recommend based on user's interests
    let recommendations = [];

    // 1. Recommend from same courses as favorites
    if (favorites.results.length > 0) {
      const courseCodes = [...new Set(favorites.results.map(f => f.course_code).filter(Boolean))];
      if (courseCodes.length > 0) {
        const courseRecommendations = await env.DB.prepare(`
          SELECT d.*, u.name as author_name 
          FROM documents d 
          JOIN users u ON d.user_id = u.id 
          WHERE d.course_code IN (${courseCodes.map(() => '?').join(',')})
            AND d.id NOT IN (SELECT document_id FROM user_favorites WHERE user_id = ?)
          ORDER BY d.view_count DESC 
          LIMIT 5
        `).bind(...courseCodes, user.id).all();
        
        recommendations.push(...courseRecommendations.results.map(doc => ({
          ...doc,
          recommendation_reason: 'Similar to your favorites',
          score: 0.9
        })));
      }
    }

    // 2. Recommend based on search history
    if (searchHistory.results.length > 0) {
      const searchTerms = searchHistory.results.map(s => s.query);
      const searchRecommendations = await env.DB.prepare(`
        SELECT d.*, u.name as author_name 
        FROM documents d 
        JOIN users u ON d.user_id = u.id 
        WHERE (${searchTerms.map(() => 'd.title LIKE ? OR d.description LIKE ?').join(' OR ')})
          AND d.id NOT IN (SELECT document_id FROM user_favorites WHERE user_id = ?)
        ORDER BY d.view_count DESC 
        LIMIT 5
      `).bind(...searchTerms.flatMap(term => [`%${term}%`, `%${term}%`]), user.id).all();

      recommendations.push(...searchRecommendations.results.map(doc => ({
        ...doc,
        recommendation_reason: 'Based on your search history',
        score: 0.8
      })));
    }

    // 3. Collaborative filtering: recommend what similar users like
    const similarUsers = await env.DB.prepare(`
      SELECT DISTINCT f2.user_id 
      FROM user_favorites f1 
      JOIN user_favorites f2 ON f1.document_id = f2.document_id 
      WHERE f1.user_id = ? AND f2.user_id != ?
      LIMIT 10
    `).bind(user.id, user.id).all();

    if (similarUsers.results.length > 0) {
      const similarUserIds = similarUsers.results.map(u => u.user_id);
      const collaborativeRecommendations = await env.DB.prepare(`
        SELECT d.*, u.name as author_name, COUNT(*) as popularity
        FROM user_favorites f 
        JOIN documents d ON f.document_id = d.id 
        JOIN users u ON d.user_id = u.id
        WHERE f.user_id IN (${similarUserIds.map(() => '?').join(',')})
          AND d.id NOT IN (SELECT document_id FROM user_favorites WHERE user_id = ?)
        GROUP BY d.id
        ORDER BY popularity DESC, d.view_count DESC
        LIMIT 5
      `).bind(...similarUserIds, user.id).all();

      recommendations.push(...collaborativeRecommendations.results.map(doc => ({
        ...doc,
        recommendation_reason: 'Popular among similar users',
        score: 0.7
      })));
    }

    // 4. Trending documents
    const trending = await env.DB.prepare(`
      SELECT d.*, u.name as author_name 
      FROM documents d 
      JOIN users u ON d.user_id = u.id 
      WHERE d.created_at > date('now', '-7 days')
        AND d.id NOT IN (SELECT document_id FROM user_favorites WHERE user_id = ?)
      ORDER BY d.view_count DESC 
      LIMIT 3
    `).bind(user.id).all();

    recommendations.push(...trending.results.map(doc => ({
      ...doc,
      recommendation_reason: 'Trending this week',
      score: 0.6
    })));

    // Remove duplicates and sort by score
    const uniqueRecommendations = recommendations
      .filter((doc, index, self) => 
        index === self.findIndex(d => d.id === doc.id)
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    debugLog('Recommendations generated', { count: uniqueRecommendations.length });

    return new Response(JSON.stringify({
      recommendations: uniqueRecommendations,
      algorithm: 'hybrid-content-collaborative',
      authenticated: true,
      user_profile: {
        favorites_count: favorites.results.length,
        search_history_count: searchHistory.results.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Analytics endpoint
async function handleAnalytics(request, env, method, debugLog) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'GET') {
    const user = await authenticateUser(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get various analytics
    const [userStats, popularDocuments, recentSearches, coursePop] = await Promise.all([
      // User statistics
      env.DB.prepare(`
        SELECT 
          (SELECT COUNT(*) FROM documents WHERE user_id = ?) as documents_uploaded,
          (SELECT COUNT(*) FROM user_favorites WHERE user_id = ?) as favorites_count,
          (SELECT COUNT(*) FROM search_history WHERE user_id = ?) as searches_count
      `).bind(user.id, user.id, user.id).first(),
      
      // Popular documents
      env.DB.prepare(`
        SELECT d.title, d.view_count, d.download_count 
        FROM documents d 
        ORDER BY d.view_count DESC 
        LIMIT 5
      `).all(),
      
      // Recent searches
      env.DB.prepare(`
        SELECT query, COUNT(*) as frequency 
        FROM search_history 
        WHERE created_at > date('now', '-7 days')
        GROUP BY query 
        ORDER BY frequency DESC 
        LIMIT 10
      `).all(),
      
      // Course popularity
      env.DB.prepare(`
        SELECT course_code, COUNT(*) as doc_count 
        FROM documents 
        WHERE course_code IS NOT NULL AND course_code != ''
        GROUP BY course_code 
        ORDER BY doc_count DESC 
        LIMIT 10
      `).all()
    ]);

    return new Response(JSON.stringify({
      user_stats: userStats,
      popular_documents: popularDocuments.results,
      recent_searches: recentSearches.results,
      course_popularity: coursePop.results,
      generated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Enhanced Upload handler with file processing
async function handleUpload(request, env, method, debugLog) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'POST') {
    const user = await authenticateUser(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const formData = await request.formData();
      const files = formData.getAll('files');
      
      if (files.length === 0) {
        return new Response(JSON.stringify({ error: 'No files provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const uploadResults = [];

      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          uploadResults.push({
            filename: file.name,
            error: 'File too large (max 10MB)'
          });
          continue;
        }

        try {
          const fileBuffer = await file.arrayBuffer();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
          
          // Store in R2 if available
          if (env.STORAGE) {
            await env.STORAGE.put(fileName, fileBuffer);
          }

          uploadResults.push({
            filename: file.name,
            stored_as: fileName,
            size: file.size,
            type: file.type,
            url: env.STORAGE ? `https://your-domain.com/files/${fileName}` : fileName
          });

          debugLog('File uploaded', { filename: file.name, size: file.size });
        } catch (error) {
          uploadResults.push({
            filename: file.name,
            error: error.message
          });
        }
      }

      return new Response(JSON.stringify({
        message: 'Upload completed',
        results: uploadResults,
        successful: uploadResults.filter(r => !r.error).length,
        failed: uploadResults.filter(r => r.error).length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      debugLog('Upload error', { error: error.message });
      return new Response(JSON.stringify({ error: 'Upload failed' }), {
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

// User management
async function handleUsers(request, env, method, subRoute, debugLog) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  const user = await authenticateUser(request, env);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Authentication required' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  switch (subRoute) {
    case 'profile':
      if (method === 'GET') {
        return new Response(JSON.stringify({ user }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (method === 'PUT') {
        const { name, avatar_url } = await request.json();
        
        await env.DB.prepare(
          'UPDATE users SET name = ?, avatar_url = ?, updated_at = ? WHERE id = ?'
        ).bind(name || user.name, avatar_url || user.avatar_url, new Date().toISOString(), user.id).run();

        return new Response(JSON.stringify({ message: 'Profile updated' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      break;

    case 'favorites':
      if (method === 'GET') {
        const { results } = await env.DB.prepare(`
          SELECT d.*, u.name as author_name 
          FROM user_favorites f 
          JOIN documents d ON f.document_id = d.id 
          JOIN users u ON d.user_id = u.id
          WHERE f.user_id = ?
          ORDER BY f.created_at DESC
        `).bind(user.id).all();

        return new Response(JSON.stringify({ favorites: results }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (method === 'POST') {
        const { document_id } = await request.json();
        
        await env.DB.prepare(`
          INSERT OR IGNORE INTO user_favorites (id, user_id, document_id, created_at)
          VALUES (?, ?, ?, ?)
        `).bind(crypto.randomUUID(), user.id, document_id, new Date().toISOString()).run();

        return new Response(JSON.stringify({ message: 'Added to favorites' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      break;
  }

  return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Simple password hashing (use proper bcrypt in production)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
} 