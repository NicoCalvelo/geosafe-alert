import { DateTime } from 'luxon'
import Event from '#models/event'
import Source from '#models/source'
import AlertType from '#models/alert_type'
import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'
import CopernicusService from '#services/copernicus_service'
import { searchEventValidator } from '#validators/search_event'
import { st } from '#services/postgis_service' // Notre instance Knex-PostGIS

export default class EventsController {
  public async ingest({ response }: HttpContext) {
    const service = new CopernicusService()
    const data = await service.fetchLatestEvents()

    // 1. Récupérer les Clés Étrangères (FK) existantes
    // On utilise findByOrFail car si la source n'existe pas, on doit s'arrêter
    const copernicusSource = await Source.findByOrFail('key', 'copernicus')

    // Pour l'exemple, on dit que ce sont des 'fire' (ID 1 dans notre seed)
    const fireType = await AlertType.findByOrFail('code', 'fire')

    let count = 0

    // 2. Boucle et Mapping
    for (const item of data) {
      // updateOrCreate : On cherche par 'externalId', si trouvé on update, sinon on crée
      await Event.updateOrCreate(
        { externalId: item.Id }, // Critère de recherche unique
        {
          sourceId: copernicusSource.id,
          alertTypeId: fireType.id,
          title: item.Name,
          status: 'active',
          level: 3,
          description: item.Description,
          // Mapping de la date ISO string -> Luxon DateTime
          eventTime: DateTime.fromISO(item.ContentDate.Start),
          // LA MAGIE SPATIALE : Conversion GeoJSON -> Geometry PostGIS
          geom: st.geomFromGeoJSON(item.GeoFootprint),
          // On garde la donnée brute
          raw: item,
        }
      )
      count++
    }

    return response.ok({ message: `${count} événements ingérés avec succès.` })
  }

  public async nearby({ request, response }: HttpContext) {
    const { lat, lon, radius } = await request.validateUsing(searchEventValidator)
    const searchRadius = radius || 50000

    // 1. Récupérer le client Knex brut depuis Lucid
    const knex = db.connection().getWriteClient()

    // 2. Création du point utilisateur reutilisable pour la distance et le filtrage
    const userLocation = st.geomFromText(`POINT(${lon} ${lat})`, 4326)

    const events = await db
      .from('events')
      .join('alert_types', 'events.alert_type_id', 'alert_types.id')
      .select(
        'events.id',
        'events.title',
        'events.event_time',
        'alert_types.label',
        'alert_types.color',
        'alert_types.icon'
      )
      // 3. Calcul de la distance entre l'événement et l'utilisateur
      .select(
        st
          .distance(knex.raw('events.geom::geography'), knex.raw('?::geography', [userLocation]))
          .as('distance_meters')
      )

      .select(st.asGeoJSON('events.geom').as('geom'))

      // 4. Filtrage par distance
      .where(
        st.dwithin(
          knex.raw('events.geom::geography'),
          knex.raw('?::geography', [userLocation]),
          searchRadius
        )
      )
      .orderBy('distance_meters', 'asc')

    return response.ok(events)
  }
}
