import { DateTime } from 'luxon'
import IndexZone from '#models/index_zone'
import IndexType from '#models/index_type'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'

export default class IndexValue extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare zoneId: string

  @column()
  declare indexTypeId: number

  @column()
  declare value: number

  @column()
  declare level: string

  @column.dateTime({ autoCreate: true })
  declare computedAt: DateTime

  @belongsTo(() => IndexZone, { foreignKey: 'zoneId' })
  declare zone: BelongsTo<typeof IndexZone>

  @belongsTo(() => IndexType, { foreignKey: 'indexTypeId' })
  declare indexType: BelongsTo<typeof IndexType>
}
