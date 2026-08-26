import { DateTime } from 'luxon'
import User from '#models/user'
import IndexZone from '#models/index_zone'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'

export default class ZoneSubscription extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare zoneId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => IndexZone, { foreignKey: 'zoneId' })
  declare zone: BelongsTo<typeof IndexZone>
}
