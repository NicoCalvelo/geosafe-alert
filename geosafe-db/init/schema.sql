-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. TABLE : users
CREATE TABLE users (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           text UNIQUE NOT NULL,
    password_hash   text NOT NULL,
    role            text NOT NULL DEFAULT 'reader',
    created_at      timestamptz DEFAULT now()
);

-- 3. TABLE : sources
CREATE TABLE sources (
    id              serial PRIMARY KEY,
    key             text UNIQUE NOT NULL,
    display_name    text NOT NULL,
    description     text,
    endpoint        text,
    params          jsonb,
    created_at      timestamptz DEFAULT now()
);

-- 4. TABLE : alert_types
CREATE TABLE alert_types (
    id      serial PRIMARY KEY,
    code    text UNIQUE NOT NULL,
    label   text NOT NULL,
    icon    text,
    color   text
);

-- 5. TABLE : events
CREATE TABLE events (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id       integer REFERENCES sources(id) ON DELETE SET NULL,
    external_id     text,
    alert_type_id   integer REFERENCES alert_types(id),
    title           text,
    description     text,
    level           smallint,
    status          text,
    event_time      timestamptz,
    received_at     timestamptz DEFAULT now(),
    geom            geometry(Geometry, 4326),
    bbox            box2d,
    raw             jsonb
);

-- Index spatiaux et optimisations
CREATE INDEX idx_events_geom_gist ON events USING GIST (geom);
CREATE INDEX idx_events_event_time ON events (event_time);
CREATE INDEX idx_events_source_external ON events (source_id, external_id);

-- Trigger BBOX
CREATE OR REPLACE FUNCTION events_update_bbox() 
RETURNS trigger AS $$
BEGIN
    IF NEW.geom IS NOT NULL THEN
        NEW.bbox = ST_Box2D(NEW.geom);
    ELSE
        NEW.bbox = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_events_bbox
BEFORE INSERT OR UPDATE ON events
FOR EACH ROW EXECUTE PROCEDURE events_update_bbox();

-- 6. TABLE : cities [cite: 16] (Déplacé avant user_searches pour clarté, mais sans impact FK)
CREATE TABLE cities (
    id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        text,
    admin       text,
    country     text,
    geom        geometry(Point, 4326),
    population  bigint,
    metadata    jsonb
);

CREATE INDEX idx_cities_geom_gist ON cities USING GIST (geom);
CREATE INDEX idx_cities_name ON cities (lower(name));

-- 7. TABLE : user_searches [cite: 13, 14, 15]
CREATE TABLE user_searches (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         uuid REFERENCES users(id) ON DELETE SET NULL,
    session_id      text,
    name            text,
    created_at      timestamptz DEFAULT now(),
    params          jsonb,
    bbox            geometry(Polygon, 4326),
    city_name       text,
    results_count   integer
);

CREATE INDEX idx_user_searches_bbox_gist ON user_searches USING GIST (bbox);