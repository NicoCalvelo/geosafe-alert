import type { HttpContext } from '@adonisjs/core/http'
import { updateProfileValidator } from '#validators/profile'

export default class ProfileController {
  async show({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    return response.ok({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      locationAddress: user.location_address,
      locationLat: user.location_lat,
      locationLng: user.location_lng,
    })
  }

  async update({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(updateProfileValidator)

    if (data.fullName !== undefined) user.full_name = data.fullName
    if (data.locationAddress !== undefined) user.location_address = data.locationAddress ?? null
    if (data.locationLat !== undefined) user.location_lat = data.locationLat ?? null
    if (data.locationLng !== undefined) user.location_lng = data.locationLng ?? null

    await user.save()

    return response.ok({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      locationAddress: user.location_address,
      locationLat: user.location_lat,
      locationLng: user.location_lng,
    })
  }
}
