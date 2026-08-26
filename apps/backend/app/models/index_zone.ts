import { DateTime } from 'luxon'
import IndexValue from '#models/index_value'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'

export default class IndexZone extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare cellX: number

  @column()
  declare cellY: number

  // Geometry(Polygon) - 'any' car PostGIS retourne un binaire ou GeoJSON selon la requête
  @column()
  declare geom: any

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @hasMany(() => IndexValue, { foreignKey: 'zoneId' })
  declare values: HasMany<typeof IndexValue>
}
