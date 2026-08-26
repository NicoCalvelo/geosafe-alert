import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Date de l'événement lui-même, distincte de created_at (horodatage de détection)
    await this.db.rawQuery(`ALTER TABLE zone_alerts ADD COLUMN alert_date timestamptz`)
  }

  async down() {
    await this.db.rawQuery(`ALTER TABLE zone_alerts DROP COLUMN IF EXISTS alert_date`)
  }
}
