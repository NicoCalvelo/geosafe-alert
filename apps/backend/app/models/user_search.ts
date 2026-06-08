import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class UserSearch extends BaseModel {
  // On spécifie le nom de table car le pluriel de search est irrégulier
  // (Adonis devine souvent 'userSearches', mais c'est bien de forcer si besoin)
  public static table = 'user_searches'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string | null

  @column()
  declare sessionId: string | null

  @column()
  declare name: string | null

  // JSONB contenant les filtres appliqués (ex: { type: 'fire' })
  @column()
  declare params: object | null

  // Zone de recherche (Polygon)
  @column()
  declare bbox: any

  @column()
  declare cityName: string | null

  @column()
  declare resultsCount: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  // Relation optionnelle
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}