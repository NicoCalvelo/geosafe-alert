import type { HttpContext } from '@adonisjs/core/http'
import ZoneAlert from '#models/zone_alert'
import ZoneAlertsService from '#services/zone_alerts_service'

export default class ZoneAlertsController {
  public async list({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const alerts = await ZoneAlert.query()
      .where('userId', user.id)
      .orderBy('createdAt', 'desc')
      .limit(50)

    return response.ok(alerts)
  }

  public async check({ response }: HttpContext) {
    const service = new ZoneAlertsService()
    const result = await service.checkAndCreateAlerts()

    return response.ok(result)
  }
}
