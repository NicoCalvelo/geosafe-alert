import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'

export default class EventsController {
  public async index({}: HttpContext) {
    const event = await Event.query().preload('source').first()
    return event
  }
}
