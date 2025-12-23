import type { HttpContext } from '@adonisjs/core/http'
import { st } from '#services/postgis_service' // Notre instance Knex-PostGIS
import CopernicusService from '#services/copernicus_service'
import Event from '#models/event'
import Source from '#models/source'
import AlertType from '#models/alert_type'
import { DateTime } from 'luxon'

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
}
