-- Presently Database Schema
-- PostgreSQL/MySQL compatible schema for the gift ideas workflow system

-- Users table for authentication and role management
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('editor', 'reviewer', 'admin') DEFAULT 'editor',
    google_id VARCHAR(255) UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Gift posts table - main content entity
CREATE TABLE gift_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    status ENUM('neu', 'text_generiert', 'bild_generiert', 'review', 'freigegeben', 'gepostet_blogger', 'gepostet_pinterest', 'gepostet_komplett') DEFAULT 'neu',
    created_by INTEGER REFERENCES users(id),
    reviewer_id INTEGER REFERENCES users(id),
    
    -- Theme/Topic details
    anlass VARCHAR(100),
    hobby VARCHAR(100),
    alter VARCHAR(50),
    beruf VARCHAR(100),
    stil VARCHAR(100),
    budget VARCHAR(50),
    zusatzinfo TEXT,
    
    -- Generated content
    blog_html TEXT,
    pin_description TEXT,
    pin_tags JSON, -- Array of hashtags
    image_url TEXT,
    image_alt_text TEXT,
    
    -- Publishing URLs
    blogger_url TEXT,
    blogger_post_id VARCHAR(255),
    pinterest_url TEXT,
    pinterest_pin_id VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    published_blogger_at TIMESTAMP,
    published_pinterest_at TIMESTAMP
);

-- Activity logs for audit trail
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES gift_posts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- 'created', 'text_generated', 'image_generated', 'approved', 'rejected', 'published_blogger', 'published_pinterest'
    details JSON, -- Additional context like comments, error messages, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API keys and integrations (encrypted storage)
CREATE TABLE integrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    service VARCHAR(50) NOT NULL, -- 'blogger', 'pinterest', 'gemini', 'vertex_ai'
    encrypted_credentials TEXT, -- OAuth tokens, API keys (encrypted)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Content templates for AI prompts
CREATE TABLE content_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('blog_prompt', 'pinterest_prompt', 'image_prompt') NOT NULL,
    template_text TEXT NOT NULL,
    variables JSON, -- Template variables like {anlass}, {hobby}, etc.
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Affiliate links management
CREATE TABLE affiliate_links (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    amazon_asin VARCHAR(20),
    affiliate_tag VARCHAR(50),
    category VARCHAR(100), -- 'kaffee', 'technik', 'garten', etc.
    price_range VARCHAR(50),
    link_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_gift_posts_status ON gift_posts(status);
CREATE INDEX idx_gift_posts_created_by ON gift_posts(created_by);
CREATE INDEX idx_gift_posts_created_at ON gift_posts(created_at);
CREATE INDEX idx_activity_logs_post_id ON activity_logs(post_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Insert default content templates
INSERT INTO content_templates (name, type, template_text, variables, is_default) VALUES
('Standard Blog Template', 'blog_prompt', 
'Erstelle einen SEO-optimierten Blog-Artikel über Geschenkideen für {hobby}-Liebhaber zum Anlass {anlass}. 
Zielgruppe: {alter}, Budget: {budget}, Stil: {stil}.
Der Artikel soll folgende Struktur haben:
1. Einleitung mit emotionalem Hook
2. 5-7 konkrete Geschenkideen mit Beschreibungen
3. Kaufberatung und Tipps
4. Fazit
Schreibstil: freundlich, informativ, verkaufsorientiert. Integriere natürlich Affiliate-Links.', 
'{"anlass": "string", "hobby": "string", "alter": "string", "budget": "string", "stil": "string"}', 
true),

('Pinterest Pin Template', 'pinterest_prompt',
'Erstelle eine ansprechende Pinterest Pin-Beschreibung für Geschenkideen zum Thema {hobby} für {anlass}.
Zielgruppe: {alter}, Budget: {budget}.
Die Beschreibung soll:
- Emotional ansprechen
- Relevante Keywords enthalten
- Call-to-Action haben
- 2-3 Sätze lang sein
Zusätzlich erstelle 8-12 relevante Hashtags.',
'{"anlass": "string", "hobby": "string", "alter": "string", "budget": "string"}',
true),

('Product Image Template', 'image_prompt',
'Professional product photography showing gift ideas for {hobby} enthusiasts. 
Style: {stil}, occasion: {anlass}, budget range: {budget}.
Composition: Flat lay or arranged display on neutral background.
Lighting: Soft, natural lighting. High quality, Pinterest-ready image.',
'{"hobby": "string", "stil": "string", "anlass": "string", "budget": "string"}',
true);
