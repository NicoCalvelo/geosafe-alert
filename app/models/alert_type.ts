import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class AlertType extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare code: string

  @column()
  declare label: string

  @column()
  declare icon: string | null

  @column()
  declare color: string | null
}