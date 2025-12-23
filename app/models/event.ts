import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Source from '#models/source'
import AlertType from '#models/alert_type'

export default class Event extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare sourceId: number

  @column()
  declare alertTypeId: number

  @column()
  declare externalId: string | null

  @column()
  declare title: string | null

  @column()
  declare description: string | null

  @column()
  declare level: number | null

  @column()
  declare status: string | null

  // Gestion des dates
  // 'event_time' est une date métier (ex: date du séisme), pas la date de création en base
  @column.dateTime()
  declare eventTime: DateTime | null

  // 'received_at' correspond au 'created_at' technique
  @column.dateTime({ autoCreate: true })
  declare receivedAt: DateTime

  // DONNÉES SPATIALES & BRUTES
  
  // Geometry(Geometry, 4326)
  @column()
  declare geom: any

  // Box2D (calculé automatiquement par trigger en base, mais lisible ici)
  @column()
  declare bbox: any

  // JSONB (Payload original de l'API Copernicus)
  @column()
  declare raw: any

  // RELATIONS
  @belongsTo(() => Source)
  declare source: BelongsTo<typeof Source>

  @belongsTo(() => AlertType)
  declare alertType: BelongsTo<typeof AlertType>
}