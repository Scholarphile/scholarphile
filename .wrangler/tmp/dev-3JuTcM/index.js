var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-WszPCK/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// src/index.js
var SESSION_DURATION = 24 * 60 * 60 * 1e3;
var src_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Debug-Mode",
      "Access-Control-Expose-Headers": "X-Debug-Info, X-Request-Id"
    };
    const requestId = crypto.randomUUID();
    const debugMode = request.headers.get("X-Debug-Mode") === "true";
    const debugLog = /* @__PURE__ */ __name((message, data = null) => {
      if (debugMode) {
        console.log(`[${requestId}] ${message}`, data || "");
      }
    }, "debugLog");
    debugLog("Request received", { method, path, headers: Object.fromEntries(request.headers) });
    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    try {
      const startTime = Date.now();
      let response;
      if (path.startsWith("/api/")) {
        response = await handleAPI(request, env, path, method, debugLog, requestId);
      } else if (path === "/health") {
        const healthInfo = {
          status: "healthy",
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          version: "2.0.0",
          environment: env.ENVIRONMENT || "development",
          requestId,
          databases: {
            d1: !!env.DB,
            r2: !!env.STORAGE
          }
        };
        response = new Response(JSON.stringify(healthInfo), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } else if (path === "/debug" && debugMode) {
        const debugInfo = {
          environment: env.ENVIRONMENT || "development",
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          requestId,
          headers: Object.fromEntries(request.headers),
          cf: request.cf,
          url: request.url
        };
        response = new Response(JSON.stringify(debugInfo, null, 2), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } else {
        response = new Response("Scholarphile API - Not Found", {
          status: 404,
          headers: corsHeaders
        });
      }
      const endTime = Date.now();
      if (debugMode) {
        response.headers.set("X-Debug-Info", JSON.stringify({
          requestId,
          duration: `${endTime - startTime}ms`,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }));
        response.headers.set("X-Request-Id", requestId);
      }
      debugLog("Response sent", { status: response.status, duration: `${endTime - startTime}ms` });
      return response;
    } catch (error) {
      debugLog("Worker error", { error: error.message, stack: error.stack });
      console.error("Worker error:", error);
      const errorResponse = {
        error: "Internal Server Error",
        message: debugMode ? error.message : "An error occurred",
        requestId,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (debugMode) {
        errorResponse.stack = error.stack;
      }
      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "X-Request-Id": requestId
        }
      });
    }
  }
};
async function handleAPI(request, env, path, method, debugLog, requestId) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Debug-Mode"
  };
  const routeParts = path.replace("/api/", "").split("/");
  const route = routeParts[0];
  const subRoute = routeParts[1];
  debugLog("API route", { route, subRoute, method });
  switch (route) {
    case "auth":
      return await handleAuth(request, env, method, subRoute, debugLog);
    case "documents":
      return await handleDocuments(request, env, method, subRoute, debugLog);
    case "users":
      return await handleUsers(request, env, method, subRoute, debugLog);
    case "search":
      return await handleSearch(request, env, method, debugLog);
    case "recommendations":
      return await handleRecommendations(request, env, method, debugLog);
    case "analytics":
      return await handleAnalytics(request, env, method, debugLog);
    case "upload":
      return await handleUpload(request, env, method, debugLog);
    default:
      return new Response(JSON.stringify({
        error: "Route not found",
        availableRoutes: ["auth", "documents", "users", "search", "recommendations", "analytics", "upload"],
        requestId
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
  }
}
__name(handleAPI, "handleAPI");
async function authenticateUser(request, env) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  try {
    const session = await env.DB.prepare(
      "SELECT s.*, u.* FROM user_sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > ?"
    ).bind(token, (/* @__PURE__ */ new Date()).toISOString()).first();
    return session;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}
__name(authenticateUser, "authenticateUser");
async function handleAuth(request, env, method, subRoute, debugLog) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  debugLog("Auth handler", { method, subRoute });
  switch (subRoute) {
    case "register":
      if (method === "POST") {
        const { email, name, password } = await request.json();
        if (!email || !name || !password) {
          return new Response(JSON.stringify({ error: "Email, name, and password are required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        const existingUser = await env.DB.prepare(
          "SELECT id FROM users WHERE email = ?"
        ).bind(email).first();
        if (existingUser) {
          return new Response(JSON.stringify({ error: "User already exists" }), {
            status: 409,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        const userId = crypto.randomUUID();
        const passwordHash = await hashPassword(password);
        const { success } = await env.DB.prepare(`
          INSERT INTO users (id, email, name, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?)
        `).bind(userId, email, name, (/* @__PURE__ */ new Date()).toISOString(), (/* @__PURE__ */ new Date()).toISOString()).run();
        if (success) {
          const token = crypto.randomUUID();
          const expiresAt = new Date(Date.now() + SESSION_DURATION).toISOString();
          await env.DB.prepare(`
            INSERT INTO user_sessions (id, user_id, token, expires_at)
            VALUES (?, ?, ?, ?)
          `).bind(crypto.randomUUID(), userId, token, expiresAt).run();
          debugLog("User registered", { userId, email });
          return new Response(JSON.stringify({
            message: "User registered successfully",
            user: { id: userId, email, name },
            token,
            expiresAt
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      }
      break;
    case "login":
      if (method === "POST") {
        const { email, password } = await request.json();
        if (!email || !password) {
          return new Response(JSON.stringify({ error: "Email and password are required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        const user = await env.DB.prepare(
          "SELECT * FROM users WHERE email = ?"
        ).bind(email).first();
        if (!user) {
          return new Response(JSON.stringify({ error: "Invalid credentials" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + SESSION_DURATION).toISOString();
        await env.DB.prepare(`
          INSERT INTO user_sessions (id, user_id, token, expires_at)
          VALUES (?, ?, ?, ?)
        `).bind(crypto.randomUUID(), user.id, token, expiresAt).run();
        debugLog("User logged in", { userId: user.id, email });
        return new Response(JSON.stringify({
          message: "Login successful",
          user: { id: user.id, email: user.email, name: user.name },
          token,
          expiresAt
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      break;
    case "logout":
      if (method === "POST") {
        const user = await authenticateUser(request, env);
        if (!user) {
          return new Response(JSON.stringify({ error: "Not authenticated" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        await env.DB.prepare(
          "DELETE FROM user_sessions WHERE token = ?"
        ).bind(request.headers.get("Authorization").substring(7)).run();
        debugLog("User logged out", { userId: user.id });
        return new Response(JSON.stringify({ message: "Logout successful" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      break;
    case "me":
      if (method === "GET") {
        const user = await authenticateUser(request, env);
        if (!user) {
          return new Response(JSON.stringify({ error: "Not authenticated" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
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
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      break;
  }
  return new Response(JSON.stringify({ error: "Endpoint not found" }), {
    status: 404,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(handleAuth, "handleAuth");
async function handleDocuments(request, env, method, subRoute, debugLog) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  debugLog("Documents handler", { method, subRoute });
  switch (method) {
    case "GET":
      if (subRoute) {
        const document = await env.DB.prepare(
          "SELECT d.*, u.name as author_name FROM documents d JOIN users u ON d.user_id = u.id WHERE d.id = ?"
        ).bind(subRoute).first();
        if (!document) {
          return new Response(JSON.stringify({ error: "Document not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        await env.DB.prepare(
          "UPDATE documents SET view_count = view_count + 1 WHERE id = ?"
        ).bind(subRoute).run();
        return new Response(JSON.stringify({ document }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } else {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "20");
        const courseCode2 = url.searchParams.get("course");
        const year2 = url.searchParams.get("year");
        const sortBy = url.searchParams.get("sort") || "created_at";
        const order = url.searchParams.get("order") || "DESC";
        const offset = (page - 1) * limit;
        let query = `
          SELECT d.*, u.name as author_name 
          FROM documents d 
          JOIN users u ON d.user_id = u.id 
          WHERE 1=1
        `;
        let params = [];
        if (courseCode2) {
          query += " AND d.course_code = ?";
          params.push(courseCode2);
        }
        if (year2) {
          query += " AND d.year = ?";
          params.push(parseInt(year2));
        }
        query += ` ORDER BY d.${sortBy} ${order} LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        const { results } = await env.DB.prepare(query).bind(...params).all();
        let countQuery = "SELECT COUNT(*) as total FROM documents WHERE 1=1";
        let countParams = [];
        if (courseCode2) {
          countQuery += " AND course_code = ?";
          countParams.push(courseCode2);
        }
        if (year2) {
          countQuery += " AND year = ?";
          countParams.push(parseInt(year2));
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
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    case "POST":
      const user = await authenticateUser(request, env);
      if (!user) {
        return new Response(JSON.stringify({ error: "Authentication required" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const formData = await request.formData();
      const file = formData.get("file");
      const title = formData.get("title");
      const description = formData.get("description");
      const courseCode = formData.get("courseCode");
      const courseName = formData.get("courseName");
      const year = formData.get("year");
      const semester = formData.get("semester");
      const tags = formData.get("tags");
      if (!file || !title) {
        return new Response(JSON.stringify({ error: "File and title are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const fileBuffer = await file.arrayBuffer();
      const fileName = `${Date.now()}-${file.name}`;
      const fileSize = fileBuffer.byteLength;
      const fileType = file.type;
      debugLog("Processing file upload", { fileName, fileSize, fileType });
      let fileUrl = fileName;
      if (env.STORAGE) {
        try {
          await env.STORAGE.put(fileName, fileBuffer);
          fileUrl = `https://your-domain.com/files/${fileName}`;
          debugLog("File uploaded to R2", { fileName });
        } catch (error) {
          debugLog("R2 upload failed", { error: error.message });
        }
      }
      let extractedText = "";
      if (fileType === "text/plain") {
        extractedText = new TextDecoder().decode(fileBuffer);
      }
      const documentId = crypto.randomUUID();
      const { success } = await env.DB.prepare(`
        INSERT INTO documents (
          id, title, description, file_url, file_size, file_type,
          course_code, course_name, year, semester, tags, user_id,
          created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        documentId,
        title,
        description || "",
        fileUrl,
        fileSize,
        fileType,
        courseCode || "",
        courseName || "",
        year ? parseInt(year) : null,
        semester || "",
        tags || "[]",
        user.id,
        (/* @__PURE__ */ new Date()).toISOString(),
        (/* @__PURE__ */ new Date()).toISOString()
      ).run();
      if (success) {
        debugLog("Document saved to database", { documentId, title });
        return new Response(JSON.stringify({
          message: "Document uploaded successfully",
          document: {
            id: documentId,
            title,
            fileUrl,
            fileSize,
            fileType
          }
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } else {
        return new Response(JSON.stringify({ error: "Failed to save document" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    case "DELETE":
      if (!subRoute) {
        return new Response(JSON.stringify({ error: "Document ID required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const deleteUser = await authenticateUser(request, env);
      if (!deleteUser) {
        return new Response(JSON.stringify({ error: "Authentication required" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const docToDelete = await env.DB.prepare(
        "SELECT * FROM documents WHERE id = ? AND user_id = ?"
      ).bind(subRoute, deleteUser.id).first();
      if (!docToDelete) {
        return new Response(JSON.stringify({ error: "Document not found or access denied" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      if (env.STORAGE && docToDelete.file_url) {
        try {
          await env.STORAGE.delete(docToDelete.file_url);
        } catch (error) {
          debugLog("R2 delete failed", { error: error.message });
        }
      }
      await env.DB.prepare("DELETE FROM documents WHERE id = ?").bind(subRoute).run();
      debugLog("Document deleted", { documentId: subRoute });
      return new Response(JSON.stringify({ message: "Document deleted successfully" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    default:
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
  }
}
__name(handleDocuments, "handleDocuments");
async function handleSearch(request, env, method, debugLog) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  if (method === "GET") {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");
    const courseCode = url.searchParams.get("course");
    const year = url.searchParams.get("year");
    const fileType = url.searchParams.get("type");
    if (!query) {
      return new Response(JSON.stringify({ error: "Search query required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    debugLog("Search query", { query, courseCode, year, fileType });
    const user = await authenticateUser(request, env);
    if (user) {
      await env.DB.prepare(`
        INSERT INTO search_history (id, user_id, query, created_at)
        VALUES (?, ?, ?, ?)
      `).bind(crypto.randomUUID(), user.id, query, (/* @__PURE__ */ new Date()).toISOString()).run();
    }
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
      searchQuery += " AND d.course_code = ?";
      params.push(courseCode);
    }
    if (year) {
      searchQuery += " AND d.year = ?";
      params.push(parseInt(year));
    }
    if (fileType) {
      searchQuery += " AND d.file_type LIKE ?";
      params.push(`%${fileType}%`);
    }
    searchQuery += " ORDER BY relevance_score DESC, d.view_count DESC, d.created_at DESC LIMIT 50";
    const { results } = await env.DB.prepare(searchQuery).bind(...params).all();
    if (user) {
      await env.DB.prepare(
        "UPDATE search_history SET results_count = ? WHERE user_id = ? AND query = ? ORDER BY created_at DESC LIMIT 1"
      ).bind(results.length, user.id, query).run();
    }
    debugLog("Search results", { count: results.length });
    return new Response(JSON.stringify({
      results,
      query,
      total: results.length,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(handleSearch, "handleSearch");
async function handleRecommendations(request, env, method, debugLog) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  if (method === "GET") {
    const user = await authenticateUser(request, env);
    if (!user) {
      const { results: results2 } = await env.DB.prepare(`
        SELECT d.*, u.name as author_name 
        FROM documents d 
        JOIN users u ON d.user_id = u.id 
        ORDER BY d.view_count DESC, d.download_count DESC 
        LIMIT 10
      `).all();
      return new Response(JSON.stringify({
        recommendations: results2,
        algorithm: "popularity-based",
        authenticated: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    debugLog("Generating recommendations", { userId: user.id });
    const { results } = await env.DB.prepare(`
      SELECT d.*, u.name as author_name 
      FROM documents d 
      JOIN users u ON d.user_id = u.id 
      WHERE d.user_id != ?
      ORDER BY d.view_count DESC, d.created_at DESC 
      LIMIT 5
    `).bind(user.id).all();
    const recommendations = results.map((doc) => ({
      ...doc,
      recommendation_reason: "Popular content",
      score: 0.8
    }));
    debugLog("Recommendations generated", { count: recommendations.length });
    return new Response(JSON.stringify({
      recommendations,
      algorithm: "popularity-based",
      authenticated: true
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(handleRecommendations, "handleRecommendations");
async function handleAnalytics(request, env, method, debugLog) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  if (method === "GET") {
    const user = await authenticateUser(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const userStats = await env.DB.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM documents WHERE user_id = ?) as documents_uploaded,
        (SELECT COUNT(*) FROM user_favorites WHERE user_id = ?) as favorites_count,
        (SELECT COUNT(*) FROM search_history WHERE user_id = ?) as searches_count
    `).bind(user.id, user.id, user.id).first();
    const popularDocs = await env.DB.prepare(`
      SELECT d.title, d.view_count, d.download_count 
      FROM documents d 
      ORDER BY d.view_count DESC 
      LIMIT 5
    `).all();
    return new Response(JSON.stringify({
      user_stats: userStats,
      popular_documents: popularDocs.results,
      generated_at: (/* @__PURE__ */ new Date()).toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(handleAnalytics, "handleAnalytics");
async function handleUpload(request, env, method, debugLog) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  if (method === "POST") {
    const user = await authenticateUser(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({
      message: "Upload endpoint - use /api/documents instead",
      redirect: "/api/documents"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(handleUpload, "handleUpload");
async function handleUsers(request, env, method, subRoute, debugLog) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  const user = await authenticateUser(request, env);
  if (!user) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  switch (subRoute) {
    case "profile":
      if (method === "GET") {
        return new Response(JSON.stringify({ user }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } else if (method === "PUT") {
        const { name, avatar_url } = await request.json();
        await env.DB.prepare(
          "UPDATE users SET name = ?, avatar_url = ?, updated_at = ? WHERE id = ?"
        ).bind(name || user.name, avatar_url || user.avatar_url, (/* @__PURE__ */ new Date()).toISOString(), user.id).run();
        return new Response(JSON.stringify({ message: "Profile updated" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      break;
    case "favorites":
      if (method === "GET") {
        const { results } = await env.DB.prepare(`
          SELECT d.*, u.name as author_name 
          FROM user_favorites f 
          JOIN documents d ON f.document_id = d.id 
          JOIN users u ON d.user_id = u.id
          WHERE f.user_id = ?
          ORDER BY f.created_at DESC
        `).bind(user.id).all();
        return new Response(JSON.stringify({ favorites: results }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } else if (method === "POST") {
        const { document_id } = await request.json();
        await env.DB.prepare(`
          INSERT OR IGNORE INTO user_favorites (id, user_id, document_id, created_at)
          VALUES (?, ?, ?, ?)
        `).bind(crypto.randomUUID(), user.id, document_id, (/* @__PURE__ */ new Date()).toISOString()).run();
        return new Response(JSON.stringify({ message: "Added to favorites" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      break;
  }
  return new Response(JSON.stringify({ error: "Endpoint not found" }), {
    status: 404,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(handleUsers, "handleUsers");
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(hashPassword, "hashPassword");

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-WszPCK/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-WszPCK/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
