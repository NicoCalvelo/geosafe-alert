import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // ── Extensions ──────────────────────────────────────────
    await this.db.rawQuery(`CREATE EXTENSION IF NOT EXISTS postgis`)
    await this.db.rawQuery(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`)
    await this.db.rawQuery(`CREATE EXTENSION IF NOT EXISTS pgcrypto`)

    // ── users ───────────────────────────────────────────────
    await this.db.rawQuery(`
      CREATE TABLE users (
        id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        email         text UNIQUE NOT NULL,
        password_hash text NOT NULL,
        full_name     text,
        role          text NOT NULL DEFAULT 'reader',
        created_at    timestamptz DEFAULT now(),
        updated_at    timestamptz DEFAULT now()
      )
    `)

    // ── sources ─────────────────────────────────────────────
    await this.db.rawQuery(`
      CREATE TABLE sources (
        id           serial PRIMARY KEY,
        key          text UNIQUE NOT NULL,
        display_name text NOT NULL,
        description  text,
        endpoint     text,
        params       jsonb,
        created_at   timestamptz DEFAULT now()
      )
    `)

    // ── alert_types ─────────────────────────────────────────
    await this.db.rawQuery(`
      CREATE TABLE alert_types (
        id    serial PRIMARY KEY,
        code  text UNIQUE NOT NULL,
        label text NOT NULL,
        icon  text,
        color text
      )
    `)

    // ── events ───────────────────────────────────────────────
    await this.db.rawQuery(`
      CREATE TABLE events (
        id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        source_id     integer REFERENCES sources(id) ON DELETE SET NULL,
        external_id   text,
        alert_type_id integer REFERENCES alert_types(id),
        title         text,
        description   text,
        level         smallint,
        status        text,
        event_time    timestamptz,
        end_time      timestamptz,
        received_at   timestamptz DEFAULT now(),
        geom          geometry(Geometry, 4326),
        bbox          box2d,
        raw           jsonb
      )
    `)

    await this.db.rawQuery(`CREATE INDEX idx_events_geom_gist ON events USING GIST (geom)`)
    await this.db.rawQuery(`CREATE INDEX idx_events_event_time ON events (event_time)`)
    await this.db.rawQuery(
      `CREATE INDEX idx_events_source_external ON events (source_id, external_id)`
    )

    // Trigger : calcul automatique de bbox à partir de geom
    await this.db.rawQuery(`
      CREATE OR REPLACE FUNCTION events_update_bbox()
      RETURNS trigger AS $$
      BEGIN
        IF NEW.geom IS NOT NULL THEN
          NEW.bbox = Box2D(NEW.geom);
        ELSE
          NEW.bbox = NULL;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `)

    await this.db.rawQuery(`
      CREATE TRIGGER trg_events_bbox
      BEFORE INSERT OR UPDATE ON events
      FOR EACH ROW EXECUTE PROCEDURE events_update_bbox()
    `)

    // ── event_frames (snapshots spatio-temporels) ────────────
    await this.db.rawQuery(`
      CREATE TABLE event_frames (
        id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_id   uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        frame_time timestamptz NOT NULL,
        geom       geometry(Geometry, 4326) NOT NULL,
        properties jsonb DEFAULT '{}',
        created_at timestamptz DEFAULT now()
      )
    `)

    await this.db.rawQuery(
      `CREATE INDEX idx_event_frames_geom_gist ON event_frames USING GIST (geom)`
    )
    await this.db.rawQuery(
      `CREATE INDEX idx_event_frames_event_time ON event_frames (event_id, frame_time)`
    )

    // ── cities ───────────────────────────────────────────────
    await this.db.rawQuery(`
      CREATE TABLE cities (
        id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name       text,
        admin      text,
        country    text,
        geom       geometry(Point, 4326),
        population bigint,
        metadata   jsonb
      )
    `)

    await this.db.rawQuery(`CREATE INDEX idx_cities_geom_gist ON cities USING GIST (geom)`)
    await this.db.rawQuery(`CREATE INDEX idx_cities_name ON cities (lower(name))`)

    // ── user_searches ────────────────────────────────────────
    await this.db.rawQuery(`
      CREATE TABLE user_searches (
        id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id       uuid REFERENCES users(id) ON DELETE SET NULL,
        session_id    text,
        name          text,
        created_at    timestamptz DEFAULT now(),
        params        jsonb,
        bbox          geometry(Polygon, 4326),
        city_name     text,
        results_count integer
      )
    `)

    await this.db.rawQuery(
      `CREATE INDEX idx_user_searches_bbox_gist ON user_searches USING GIST (bbox)`
    )

    // ── auth_access_tokens ───────────────────────────────────
    await this.db.rawQuery(`
      CREATE TABLE auth_access_tokens (
        id           serial PRIMARY KEY,
        tokenable_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type         text NOT NULL,
        name         text,
        hash         text NOT NULL,
        abilities    text NOT NULL,
        created_at   timestamptz,
        updated_at   timestamptz,
        last_used_at timestamptz,
        expires_at   timestamptz
      )
    `)

    // ── Données de référence ─────────────────────────────────

    await this.db.rawQuery(`
      INSERT INTO sources (key, display_name, description, endpoint) VALUES
      ('copernicus', 'Copernicus EMS', 'European emergency mapping service', 'https://emergency.copernicus.eu'),
      ('usgs', 'USGS', 'US Geological Survey hazards feed', 'https://earthquake.usgs.gov')
    `)

    await this.db.rawQuery(`
      INSERT INTO alert_types (code, label, icon, color) VALUES
      ('fire',       'Wildfire',   'fire',           '#ff4500'),
      ('flood',      'Flood',      'water',          '#1e90ff'),
      ('earthquake', 'Earthquake', 'activity',       '#ffa500'),
      ('storm',      'Storm',      'cloud-lightning', '#8b00ff')
    `)

    await this.db.rawQuery(`
      INSERT INTO cities (name, admin, country, geom, population) VALUES
      ('Marseille', 'Provence-Alpes-Côte d''Azur', 'France',   ST_GeomFromText('POINT(5.3698 43.2965)',   4326), 870000),
      ('Rome',      'Lazio',                       'Italy',    ST_GeomFromText('POINT(12.4964 41.9028)',  4326), 2873000),
      ('Toulouse',  'Occitanie',                   'France',   ST_GeomFromText('POINT(1.4442 43.6047)',   4326), 493465),
      ('Lyon',      'Auvergne-Rhône-Alpes',        'France',   ST_GeomFromText('POINT(4.8357 45.7640)',   4326), 516092),
      ('Athens',    'Attica',                      'Greece',   ST_GeomFromText('POINT(23.7275 37.9838)',  4326), 664046),
      ('Lisbon',    'Lisboa',                      'Portugal', ST_GeomFromText('POINT(-9.1393 38.7223)',  4326), 544851),
      ('Zagreb',    'City of Zagreb',              'Croatia',  ST_GeomFromText('POINT(15.9819 45.8150)',  4326), 806341),
      ('Naples',    'Campania',                    'Italy',    ST_GeomFromText('POINT(14.2681 40.8518)',  4326), 959470)
    `)

    await this.db.rawQuery(`
      INSERT INTO users (email, password_hash, role) VALUES
      ('admin@test.com',  crypt('admin123',  gen_salt('bf')), 'admin'),
      ('reader@test.com', crypt('reader123', gen_salt('bf')), 'reader')
    `)
  }

  async down() {
    // Suppression dans l'ordre inverse (respect des FK)
    await this.db.rawQuery(`DROP TABLE IF EXISTS auth_access_tokens CASCADE`)
    await this.db.rawQuery(`DROP TABLE IF EXISTS user_searches CASCADE`)
    await this.db.rawQuery(`DROP TABLE IF EXISTS event_frames CASCADE`)
    await this.db.rawQuery(`DROP TABLE IF EXISTS events CASCADE`)
    await this.db.rawQuery(`DROP FUNCTION IF EXISTS events_update_bbox CASCADE`)
    await this.db.rawQuery(`DROP TABLE IF EXISTS cities CASCADE`)
    await this.db.rawQuery(`DROP TABLE IF EXISTS alert_types CASCADE`)
    await this.db.rawQuery(`DROP TABLE IF EXISTS sources CASCADE`)
    await this.db.rawQuery(`DROP TABLE IF EXISTS users CASCADE`)
  }
}
