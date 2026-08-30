import { DateTime } from 'luxon'
import User from '#models/user'
import Event from '#models/event'
import IndexZone from '#models/index_zone'
import IndexType from '#models/index_type'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'

export default class ZoneAlert extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare zoneId: string

  // 'index' (seuil de risque dépassé) ou 'event' (événement Copernicus dans la zone)
  @column()
  declare kind: 'index' | 'event'

  @column()
  declare indexTypeId: number | null

  @column()
  declare eventId: string | null

  @column()
  declare value: number | null

  @column()
  declare message: string

  @column()
  declare read: boolean

  // Date de l'événement lui-même (event) ; null pour les alertes d'indice
  @column.dateTime()
  declare alertDate: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => IndexZone, { foreignKey: 'zoneId' })
  declare zone: BelongsTo<typeof IndexZone>

  @belongsTo(() => IndexType, { foreignKey: 'indexTypeId' })
  declare indexType: BelongsTo<typeof IndexType>

  @belongsTo(() => Event, { foreignKey: 'eventId' })
  declare event: BelongsTo<typeof Event>
}
