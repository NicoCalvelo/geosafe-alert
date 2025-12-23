import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class City extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare admin: string | null

  @column()
  declare country: string | null

  @column()
  declare population: number | null

  // Colonne Geometry(Point)
  // On utilise 'any' car PostGIS retourne un binaire ou GeoJSON selon la requête
  @column()
  declare geom: any

  @column()
  declare metadata: object | null
}