import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Source extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare key: string

  @column()
  declare displayName: string

  @column()
  declare description: string | null

  @column()
  declare endpoint: string | null

  // Type JSONB en base, Object en TS
  @column()
  declare params: object | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}