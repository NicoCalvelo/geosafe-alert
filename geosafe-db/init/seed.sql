-- 1. USERS
INSERT INTO users (email, password_hash, role)
VALUES
('admin@test.com',  crypt('admin123', gen_salt('bf')), 'admin'),
('reader@test.com', crypt('reader123', gen_salt('bf')), 'reader');

-- 2. SOURCES
INSERT INTO sources (key, display_name, description, endpoint)
VALUES
('copernicus', 'Copernicus EMS', 'European emergency mapping service', 'https://emergency.copernicus.eu'),
('usgs', 'USGS', 'US Geological Survey hazards feed', 'https://earthquake.usgs.gov');

-- 3. ALERT TYPES
INSERT INTO alert_types (code, label, icon, color)
VALUES
('fire', 'Wildfire', 'fire', '#ff4500'),
('flood', 'Flood', 'water', '#1e90ff'),
('earthquake', 'Earthquake', 'activity', '#ffa500');

-- 4. CITIES
INSERT INTO cities (name, admin, country, geom, population)
VALUES
(
  'Marseille',
  'Provence-Alpes-Côte d’Azur',
  'France',
  ST_GeomFromText('POINT(5.3698 43.2965)', 4326),
  870000
),
(
  'Rome',
  'Lazio',
  'Italy',
  ST_GeomFromText('POINT(12.4964 41.9028)', 4326),
  2873000
);

-- 5. EVENTS
-- Note: Les IDs de sources et alert_types (1, 2, 3) correspondent à l'ordre d'insertion ci-dessus (Serial)
INSERT INTO events (source_id, external_id, alert_type_id, title, description, level, status, event_time, geom, raw)
VALUES
(
    1, -- copernicus
    'COP-2024-001',
    1, -- fire
    'Wildfire near Marseille',
    'Large wildfire detected by satellite imagery',
    4,
    'active',
    now() - interval '2 hours',
    ST_GeomFromText('POLYGON((5.30 43.25, 5.45 43.25, 5.45 43.35, 5.30 43.35, 5.30 43.25))', 4326),
    '{"confidence":0.92,"sensor":"sentinel-2"}'
),
(
    2, -- usgs
    'USGS-EQ-9981',
    3, -- earthquake
    'Earthquake near Rome',
    'Magnitude 5.1 earthquake detected',
    3,
    'ended',
    now() - interval '1 day',
    ST_GeomFromText('POINT(12.50 41.90)', 4326),
    '{"magnitude":5.1,"depth_km":10}'
);

-- 6. USER SEARCHES
-- Insertion dynamique liée à l'utilisateur créé plus haut
INSERT INTO user_searches (user_id, name, params, bbox, city_name, results_count)
SELECT
    u.id,
    'Feux autour de Marseille',
    '{"alert_types":["fire"],"status":"active"}',
    ST_GeomFromText('POLYGON((5.20 43.20, 5.50 43.20, 5.50 43.40, 5.20 43.40, 5.20 43.20))', 4326),
    'Marseille',
    1
FROM users u
WHERE u.email = 'reader@test.com';