import type { HttpContext } from '@adonisjs/core/http'
import GeocodeService from '#services/geocode_service'
import vine from '@vinejs/vine'

export default class GeocodeController {
  /**
   * Autocomplete addresses
   * GET /api/geocode/autocomplete?query=...&limit=5
   */
  async autocomplete({ request, response }: HttpContext) {
    const schema = vine.compile(
      vine.object({
        query: vine.string().minLength(2).maxLength(200),
        limit: vine.number().range([1, 10]).optional(),
        lat: vine.number().optional(),
        lng: vine.number().optional(),
      })
    )

    const data = await request.validateUsing(schema)

    const proximity =
      data.lat && data.lng
        ? { lat: data.lat, lng: data.lng }
        : undefined

    const results = await GeocodeService.autocomplete(
      data.query,
      data.limit || 5,
      proximity
    )

    return response.ok(results)
  }
}
