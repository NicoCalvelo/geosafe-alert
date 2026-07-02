import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    await this.db.rawQuery(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS location_address text,
        ADD COLUMN IF NOT EXISTS location_lat     double precision,
        ADD COLUMN IF NOT EXISTS location_lng     double precision
    `)
  }

  async down() {
    await this.db.rawQuery(`
      ALTER TABLE users
        DROP COLUMN IF EXISTS location_address,
        DROP COLUMN IF EXISTS location_lat,
        DROP COLUMN IF EXISTS location_lng
    `)
  }
}
