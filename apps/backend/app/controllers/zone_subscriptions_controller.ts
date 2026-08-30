import type { HttpContext } from '@adonisjs/core/http'
import ZoneSubscription from '#models/zone_subscription'

export default class ZoneSubscriptionsController {
  public async mine({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const subscriptions = await ZoneSubscription.query().where('userId', user.id).select('zoneId')

    return response.ok(subscriptions.map((s) => s.zoneId))
  }

  public async subscribe({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const subscription = await ZoneSubscription.firstOrCreate(
      { userId: user.id, zoneId: params.zoneId },
      { userId: user.id, zoneId: params.zoneId }
    )

    return response.ok(subscription)
  }

  public async unsubscribe({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()

    await ZoneSubscription.query().where('userId', user.id).where('zoneId', params.zoneId).delete()

    return response.ok({ message: 'Unsubscribed' })
  }
}
