import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import ZoneAlert from '#models/zone_alert'
import { getWsServer } from '#providers/ws_provider'

const knex = db.connection().getWriteClient()
const INDEX_ALERT_THRESHOLD = 60

export default class ZoneAlertsService {
  /**
   * Compare l'état actuel (valeurs d'indices + événements) aux zones suivies
   * par chaque utilisateur, crée les alertes correspondantes et les diffuse en websocket.
   */
  public async checkAndCreateAlerts() {
    const created: ZoneAlert[] = []

    // On repart d'une liste propre à chaque sync (pas d'accumulation entre syncs)
    await ZoneAlert.query().delete()

    // 1. Seuil de risque dépassé sur une zone suivie
    const indexHits = await db
      .from('zone_subscriptions')
      .join('index_values', 'index_values.zone_id', 'zone_subscriptions.zone_id')
      .join('index_types', 'index_types.id', 'index_values.index_type_id')
      .where('index_values.value', '>', INDEX_ALERT_THRESHOLD)
      .select(
        'zone_subscriptions.user_id',
        'zone_subscriptions.zone_id',
        'index_types.id as index_type_id',
        'index_types.label as index_label',
        'index_values.value'
      )

    for (const hit of indexHits) {
      const alert = await ZoneAlert.create({
        userId: hit.user_id,
        zoneId: hit.zone_id,
        kind: 'index',
        indexTypeId: hit.index_type_id,
        value: hit.value,
        message: `${hit.index_label} risk reached ${hit.value} in a zone you follow`,
      })
      created.push(alert)
    }

    // 2. Événement Copernicus détecté à l'intérieur d'une zone suivie
    // (raw SQL : le cross join + prédicat spatial ne passe pas bien par le query builder typé)
    const { rows: eventHits } = await knex.raw(
      `
      SELECT
        zs.user_id,
        zs.zone_id,
        e.id AS event_id,
        e.title,
        e.event_time,
        at.label AS alert_label
      FROM zone_subscriptions zs
      JOIN index_zones iz ON iz.id = zs.zone_id
      JOIN events e ON e.geom IS NOT NULL AND ST_Intersects(e.geom, iz.geom)
      JOIN alert_types at ON at.id = e.alert_type_id
      `
    )

    for (const hit of eventHits) {
      const alert = await ZoneAlert.create({
        userId: hit.user_id,
        zoneId: hit.zone_id,
        kind: 'event',
        eventId: hit.event_id,
        alertDate: hit.event_time ? DateTime.fromJSDate(new Date(hit.event_time)) : null,
        message: `${hit.alert_label} event "${hit.title ?? hit.event_id}" detected in a zone you follow`,
      })
      created.push(alert)
    }

    // 3. Diffusion websocket (le client filtre par userId)
    const io = getWsServer()
    if (io) {
      for (const alert of created) {
        io.of('/events').emit('zone_alert', {
          userId: alert.userId,
          id: alert.id,
          zoneId: alert.zoneId,
          kind: alert.kind,
          message: alert.message,
          createdAt: alert.createdAt.toISO(),
        })
      }
    }

    return { created: created.length }
  }
}
