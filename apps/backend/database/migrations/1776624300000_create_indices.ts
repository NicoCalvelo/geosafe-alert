import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // ── index_types ─────────────────────────────────────────
    // Populated at ingest time from the INDEX_TYPE_DEFINITIONS array (see indices_service.ts)
    await this.db.rawQuery(`
      CREATE TABLE index_types (
        id    serial PRIMARY KEY,
        code  text UNIQUE NOT NULL,
        label text NOT NULL,
        icon  text,
        color text
      )
    `)

    // ── index_zones (grille de cellules couvrant la France) ──
    await this.db.rawQuery(`
      CREATE TABLE index_zones (
        id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        cell_x     integer,
        cell_y     integer,
        geom       geometry(Polygon, 4326) NOT NULL,
        created_at timestamptz DEFAULT now()
      )
    `)

    await this.db.rawQuery(
      `CREATE INDEX idx_index_zones_geom_gist ON index_zones USING GIST (geom)`
    )

    // ── index_values (valeur d'un indice pour une zone) ──────
    await this.db.rawQuery(`
      CREATE TABLE index_values (
        id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        zone_id       uuid NOT NULL REFERENCES index_zones(id) ON DELETE CASCADE,
        index_type_id integer NOT NULL REFERENCES index_types(id) ON DELETE CASCADE,
        value         numeric(5,2) NOT NULL,
        level         text NOT NULL,
        computed_at   timestamptz DEFAULT now(),
        UNIQUE (zone_id, index_type_id)
      )
    `)

    await this.db.rawQuery(
      `CREATE INDEX idx_index_values_index_type ON index_values (index_type_id)`
    )
  }

  async down() {
    await this.db.rawQuery(`DROP TABLE IF EXISTS index_values CASCADE`)
    await this.db.rawQuery(`DROP TABLE IF EXISTS index_zones CASCADE`)
    await this.db.rawQuery(`DROP TABLE IF EXISTS index_types CASCADE`)
  }
}
