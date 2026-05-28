import { DateTime } from 'luxon'
import Event from '#models/event'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'

export default class EventFrame extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare eventId: string

  @column.dateTime()
  declare frameTime: DateTime

  @column()
  declare geom: any

  @column()
  declare properties: Record<string, any>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Event)
  declare event: BelongsTo<typeof Event>
}
