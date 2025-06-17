-- Seed data for Presently application
-- Insert sample users, posts, and configuration data

-- Insert sample users
INSERT INTO users (email, name, role, google_id) VALUES
('admin@presently.com', 'Admin User', 'admin', 'google_admin_123'),
('editor@presently.com', 'Content Editor', 'editor', 'google_editor_456'),
('reviewer@presently.com', 'Content Reviewer', 'reviewer', 'google_reviewer_789');

-- Insert sample affiliate links
INSERT INTO affiliate_links (product_name, amazon_asin, affiliate_tag, category, price_range, link_url) VALUES
('Premium Kaffeebohnen Set', 'B08XYZ123', 'presently-21', 'kaffee', '25-50', 'https://amazon.de/dp/B08XYZ123?tag=presently-21'),
('French Press Kaffeebereiter', 'B09ABC456', 'presently-21', 'kaffee', '50-100', 'https://amazon.de/dp/B09ABC456?tag=presently-21'),
('Espresso Tassen Set', 'B07DEF789', 'presently-21', 'kaffee', 'unter-25', 'https://amazon.de/dp/B07DEF789?tag=presently-21'),
('Fitness Tracker', 'B08GHI012', 'presently-21', 'fitness', '100-200', 'https://amazon.de/dp/B08GHI012?tag=presently-21'),
('Yoga Matte Premium', 'B09JKL345', 'presently-21', 'fitness', '50-100', 'https://amazon.de/dp/B09JKL345?tag=presently-21'),
('Garten Werkzeug Set', 'B07MNO678', 'presently-21', 'garten', '75-150', 'https://amazon.de/dp/B07MNO678?tag=presently-21');

-- Insert sample gift posts
INSERT INTO gift_posts (
    title, status, created_by, anlass, hobby, alter, budget, stil,
    blog_html, pin_description, pin_tags, image_url
) VALUES
(
    'Geschenke für Kaffeeliebhaber',
    'freigegeben',
    2, -- editor user
    'Geburtstag',
    'Kaffee',
    'erwachsene',
    '50-100€',
    'praktisch',
    '<h1>Die perfekten Geschenke für Kaffeeliebhaber</h1><p>Kaffee ist mehr als nur ein Getränk...</p>',
    'Entdecke die besten Geschenkideen für Kaffeeliebhaber! ☕️ Von Premium-Bohnen bis zu professionellen Zubereitungsgeräten.',
    '["#Kaffee", "#Geschenke", "#Kaffeeliebhaber", "#Geburtstag", "#Geschenkideen"]',
    '/placeholder.svg?height=600&width=800&text=Kaffee+Geschenke'
),
(
    'Fitness Geschenke für Sportbegeisterte',
    'bild_generiert',
    2,
    'Weihnachten',
    'Fitness',
    'junge-erwachsene',
    '75-150€',
    'modern',
    '<h1>Die besten Fitness-Geschenke</h1><p>Für alle, die Sport und Bewegung lieben...</p>',
    'Perfekte Fitness-Geschenke für Sportbegeisterte! 💪 Motivation und Ausrüstung in einem.',
    '["#Fitness", "#Sport", "#Geschenke", "#Weihnachten", "#Training"]',
    '/placeholder.svg?height=600&width=800&text=Fitness+Geschenke'
),
(
    'Garten Geschenke für Hobbygärtner',
    'text_generiert',
    2,
    'Muttertag',
    'Garten',
    'erwachsene',
    '25-75€',
    'nachhaltig',
    '<h1>Geschenke für Gartenliebhaber</h1><p>Der Garten als Ort der Entspannung...</p>',
    'Wunderschöne Garten-Geschenke für grüne Daumen! 🌱 Nachhaltig und praktisch.',
    '["#Garten", "#Pflanzen", "#Muttertag", "#Nachhaltigkeit", "#Geschenke"]',
    NULL
);

-- Insert activity logs for the sample posts
INSERT INTO activity_logs (post_id, user_id, action, details) VALUES
(1, 2, 'created', '{"comment": "Neues Kaffee-Thema erstellt"}'),
(1, 2, 'text_generated', '{"ai_model": "gemini-pro", "tokens_used": 1250}'),
(1, 2, 'image_generated', '{"ai_model": "vertex-ai-imagen", "prompt": "coffee gifts flat lay"}'),
(1, 3, 'approved', '{"comment": "Content ist sehr gut, kann veröffentlicht werden"}'),
(2, 2, 'created', '{"comment": "Fitness-Thema für Weihnachten"}'),
(2, 2, 'text_generated', '{"ai_model": "gemini-pro", "tokens_used": 1100}'),
(2, 2, 'image_generated', '{"ai_model": "vertex-ai-imagen", "prompt": "fitness equipment gifts"}'),
(3, 2, 'created', '{"comment": "Garten-Thema für Muttertag"}'),
(3, 2, 'text_generated', '{"ai_model": "gemini-pro", "tokens_used": 980}');
