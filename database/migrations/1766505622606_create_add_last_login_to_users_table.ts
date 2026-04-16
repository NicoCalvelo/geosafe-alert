import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    await this.db.rawQuery(`
      ALTER TABLE "${this.tableName}"
        ADD COLUMN IF NOT EXISTS full_name varchar(255),
        ADD COLUMN IF NOT EXISTS updated_at timestamptz
    `)
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('full_name')
      table.dropColumn('updated_at')
    })
  }
}
