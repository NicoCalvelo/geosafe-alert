import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Cellules de grille stables (clé naturelle) pour ne pas casser les abonnements à chaque sync
    await this.db.rawQuery(
      `ALTER TABLE index_zones ADD CONSTRAINT uq_index_zones_cell UNIQUE (cell_x, cell_y)`
    )

    // ── zone_subscriptions (un utilisateur suit une zone de la grille) ──
    await this.db.rawQuery(`
      CREATE TABLE zone_subscriptions (
        id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        zone_id    uuid NOT NULL REFERENCES index_zones(id) ON DELETE CASCADE,
        created_at timestamptz DEFAULT now(),
        UNIQUE (user_id, zone_id)
      )
    `)

    // ── zone_alerts (alerte déclenchée pour un utilisateur sur une zone suivie) ──
    await this.db.rawQuery(`
      CREATE TABLE zone_alerts (
        id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        zone_id       uuid NOT NULL REFERENCES index_zones(id) ON DELETE CASCADE,
        kind          text NOT NULL, -- 'index' | 'event'
        index_type_id integer REFERENCES index_types(id) ON DELETE SET NULL,
        event_id      uuid REFERENCES events(id) ON DELETE SET NULL,
        value         numeric(5,2),
        message       text NOT NULL,
        created_at    timestamptz DEFAULT now(),
        "read"        boolean DEFAULT false
      )
    `)

    await this.db.rawQuery(
      `CREATE INDEX idx_zone_alerts_user_created ON zone_alerts (user_id, created_at DESC)`
    )
  }

  async down() {
    await this.db.rawQuery(`DROP TABLE IF EXISTS zone_alerts CASCADE`)
    await this.db.rawQuery(`DROP TABLE IF EXISTS zone_subscriptions CASCADE`)
    await this.db.rawQuery(`ALTER TABLE index_zones DROP CONSTRAINT IF EXISTS uq_index_zones_cell`)
  }
}
