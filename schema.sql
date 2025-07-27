-- Enhanced Scholarphile Database Schema for Cloudflare D1

-- Users table with enhanced fields
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    password_hash TEXT, -- For local authentication
    last_login_at DATETIME,
    login_count INTEGER DEFAULT 0,
    preferences TEXT DEFAULT '{}', -- JSON object for user preferences
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Documents table with enhanced metadata
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    preview_url TEXT,
    file_size INTEGER,
    file_type TEXT,
    file_hash TEXT, -- For duplicate detection
    extracted_text TEXT, -- For full-text search
    course_code TEXT,
    course_name TEXT,
    year INTEGER,
    semester TEXT,
    document_type TEXT, -- notes, assignment, exam, etc.
    tags TEXT DEFAULT '[]', -- JSON array of tags
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    user_id TEXT NOT NULL,
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    processed_at DATETIME, -- When file processing completed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Enhanced user sessions for authentication
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    device_info TEXT, -- Browser/device information
    ip_address TEXT,
    expires_at DATETIME NOT NULL,
    last_activity_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User favorites/bookmarks
CREATE TABLE IF NOT EXISTS user_favorites (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    document_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    UNIQUE(user_id, document_id)
);

-- Enhanced search history for analytics and recommendations
CREATE TABLE IF NOT EXISTS search_history (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    query TEXT NOT NULL,
    results_count INTEGER DEFAULT 0,
    filters_applied TEXT DEFAULT '{}', -- JSON object for applied filters
    search_duration_ms INTEGER, -- How long the search took
    clicked_result_id TEXT, -- Which result was clicked
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (clicked_result_id) REFERENCES documents(id) ON DELETE SET NULL
);

-- Document interactions for analytics
CREATE TABLE IF NOT EXISTS document_interactions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    document_id TEXT NOT NULL,
    interaction_type TEXT NOT NULL, -- view, download, like, share
    metadata TEXT DEFAULT '{}', -- Additional interaction data
    duration_seconds INTEGER, -- How long they viewed/interacted
    ip_address TEXT,
    referrer TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Document comments/reviews
CREATE TABLE IF NOT EXISTS document_comments (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_anonymous BOOLEAN DEFAULT false,
    parent_comment_id TEXT, -- For threaded comments
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES document_comments(id) ON DELETE CASCADE
);

-- Course information
CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    department TEXT,
    credits INTEGER,
    prerequisites TEXT DEFAULT '[]', -- JSON array of prerequisite course codes
    tags TEXT DEFAULT '[]', -- JSON array of tags
    is_active BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Study groups
CREATE TABLE IF NOT EXISTS study_groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    course_id TEXT,
    creator_id TEXT NOT NULL,
    is_private BOOLEAN DEFAULT false,
    member_limit INTEGER DEFAULT 50,
    invite_code TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Study group members
CREATE TABLE IF NOT EXISTS study_group_members (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT DEFAULT 'member', -- member, moderator, admin
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(group_id, user_id)
);

-- File processing jobs
CREATE TABLE IF NOT EXISTS file_processing_jobs (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    job_type TEXT NOT NULL, -- text_extraction, thumbnail_generation, virus_scan
    status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    progress INTEGER DEFAULT 0, -- 0-100
    error_message TEXT,
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- System notifications
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL, -- document_liked, comment_added, group_invite, system_alert
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data TEXT DEFAULT '{}', -- JSON object with notification-specific data
    is_read BOOLEAN DEFAULT false,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- API usage logs for debugging and analytics
CREATE TABLE IF NOT EXISTS api_logs (
    id TEXT PRIMARY KEY,
    request_id TEXT,
    user_id TEXT,
    method TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER,
    user_agent TEXT,
    ip_address TEXT,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- System metrics for monitoring
CREATE TABLE IF NOT EXISTS system_metrics (
    id TEXT PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value REAL NOT NULL,
    metric_unit TEXT,
    tags TEXT DEFAULT '{}', -- JSON object for metric tags
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create enhanced indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_course_code ON documents(course_code);
CREATE INDEX IF NOT EXISTS idx_documents_year ON documents(year);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_view_count ON documents(view_count);
CREATE INDEX IF NOT EXISTS idx_documents_is_public ON documents(is_public);
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type);
CREATE INDEX IF NOT EXISTS idx_documents_file_hash ON documents(file_hash);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_document_id ON user_favorites(document_id);

CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(query);

CREATE INDEX IF NOT EXISTS idx_document_interactions_user_id ON document_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_document_interactions_document_id ON document_interactions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_interactions_type ON document_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_document_interactions_created_at ON document_interactions(created_at);

CREATE INDEX IF NOT EXISTS idx_document_comments_document_id ON document_comments(document_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_user_id ON document_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_created_at ON document_comments(created_at);

CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department);
CREATE INDEX IF NOT EXISTS idx_courses_is_active ON courses(is_active);

CREATE INDEX IF NOT EXISTS idx_study_groups_creator_id ON study_groups(creator_id);
CREATE INDEX IF NOT EXISTS idx_study_groups_course_id ON study_groups(course_id);
CREATE INDEX IF NOT EXISTS idx_study_groups_is_private ON study_groups(is_private);

CREATE INDEX IF NOT EXISTS idx_study_group_members_group_id ON study_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_user_id ON study_group_members(user_id);

CREATE INDEX IF NOT EXISTS idx_file_processing_jobs_document_id ON file_processing_jobs(document_id);
CREATE INDEX IF NOT EXISTS idx_file_processing_jobs_status ON file_processing_jobs(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_logs_status_code ON api_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_system_metrics_metric_name ON system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_created_at ON system_metrics(created_at);

-- Full-text search support (if needed for extracted_text)
-- Note: D1 doesn't support FTS5, so we'll use LIKE searches for now
-- In production, consider using external search services like Algolia or Elasticsearch

-- Views for common queries
CREATE VIEW IF NOT EXISTS document_stats AS
SELECT 
    d.id,
    d.title,
    d.user_id,
    d.view_count,
    d.download_count,
    d.like_count,
    COUNT(DISTINCT f.id) as favorite_count,
    COUNT(DISTINCT c.id) as comment_count,
    AVG(c.rating) as average_rating
FROM documents d
LEFT JOIN user_favorites f ON d.id = f.document_id
LEFT JOIN document_comments c ON d.id = c.document_id
GROUP BY d.id;

CREATE VIEW IF NOT EXISTS user_stats AS
SELECT 
    u.id,
    u.name,
    u.email,
    COUNT(DISTINCT d.id) as documents_uploaded,
    COUNT(DISTINCT f.id) as favorites_count,
    COUNT(DISTINCT s.id) as searches_count,
    COUNT(DISTINCT i.id) as total_interactions,
    SUM(d.view_count) as total_views_received,
    SUM(d.download_count) as total_downloads_received
FROM users u
LEFT JOIN documents d ON u.id = d.user_id
LEFT JOIN user_favorites f ON u.id = f.user_id
LEFT JOIN search_history s ON u.id = s.user_id
LEFT JOIN document_interactions i ON u.id = i.user_id
GROUP BY u.id;

-- Insert some sample courses for testing
INSERT OR IGNORE INTO courses (id, code, name, description, department, credits) VALUES
('cs101', 'CS101', 'Introduction to Computer Science', 'Basic programming and computer science concepts', 'Computer Science', 3),
('math101', 'MATH101', 'Calculus I', 'Differential and integral calculus', 'Mathematics', 4),
('phys101', 'PHYS101', 'Physics I', 'Mechanics and thermodynamics', 'Physics', 4),
('eng101', 'ENG101', 'English Composition', 'Academic writing and composition', 'English', 3),
('hist101', 'HIST101', 'World History', 'Survey of world history from ancient to modern times', 'History', 3);

-- Insert system metrics tracking
INSERT OR IGNORE INTO system_metrics (id, metric_name, metric_value, metric_unit) VALUES
('startup_time', 'system_startup_time', 0, 'ms'),
('db_size', 'database_size', 0, 'bytes'),
('active_users', 'active_users_24h', 0, 'count'),
('documents_total', 'total_documents', 0, 'count'),
('searches_today', 'searches_today', 0, 'count'); 