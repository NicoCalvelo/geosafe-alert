import { DateTime } from 'luxon'
import Event from '#models/event'
import Source from '#models/source'
import AlertType from '#models/alert_type'
import EventFrame from '#models/event_frame'
import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'
import CopernicusService from '#services/copernicus_service'
import CzmlService from '#services/czml_service'
import { getWsServer } from '#providers/ws_provider'
import { searchEventValidator, czmlQueryValidator } from '#validators/search_event'
import { st } from '#services/postgis_service' // Notre instance Knex-PostGIS

const knex = db.connection().getWriteClient()

export default class EventsController {
  public async ingest({ response }: HttpContext) {
    const service = new CopernicusService()
    const data = await service.fetchLatestEvents()

    // 1. Récupérer la source Copernicus
    const copernicusSource = await Source.findByOrFail('key', 'copernicus')

    // 2. Pré-charger tous les types d'alerte pour le mapping dynamique
    const allAlertTypes = await AlertType.all()
    const alertTypeMap = new Map(allAlertTypes.map((at) => [at.code, at]))

    let count = 0
    const ingested: Event[] = []

    // 3. Boucle et Mapping
    for (const item of data) {
      // Résolution dynamique du type d'alerte
      const alertType = alertTypeMap.get(item.AlertCode)
      if (!alertType) {
        console.warn(`[ingest] Unknown alert code: ${item.AlertCode}, skipping ${item.Id}`)
        continue
      }

      const event = await Event.updateOrCreate(
        { externalId: item.Id },
        {
          sourceId: copernicusSource.id,
          alertTypeId: alertType.id,
          title: item.Name,
          status: item.Status ?? 'active',
          level: item.Level ?? 3,
          description: item.Description,
          eventTime: DateTime.fromISO(item.ContentDate.Start),
          endTime: item.ContentDate.End ? DateTime.fromISO(item.ContentDate.End) : null,
          geom: st.geomFromGeoJSON(item.GeoFootprint),
          raw: item,
        }
      )

      // Insérer les frames spatio-temporels si présents
      if (item.Frames && item.Frames.length > 0) {
        // Supprimer les anciens frames pour cet event
        await EventFrame.query().where('eventId', event.id).delete()

        // Bulk insert des nouveaux frames
        //const knex = db.connection().getWriteClient()
        const frameRows = item.Frames.map((frame) => ({
          event_id: event.id,
          frame_time: frame.Time,
          geom: st.geomFromGeoJSON(frame.GeoFootprint),
          properties: JSON.stringify(frame.Properties ?? {}),
        }))

        await knex('event_frames').insert(frameRows)
      }

      ingested.push(event)
      count++
    }

    // 4. Émettre les nouvelles alertes via WebSocket
    const io = getWsServer()
    if (io && ingested.length > 0) {
      io.of('/events').emit('new_alerts', {
        count: ingested.length,
        ids: ingested.map((e) => e.id),
      })
    }

    return response.ok({ message: `${count} événements ingérés avec succès.` })
  }

  public async nearby({ request, response }: HttpContext) {
    const { lat, lon, radius } = await request.validateUsing(searchEventValidator)
    const searchRadius = radius || 5000

    // 1. Récupérer le client Knex brut depuis Lucid
    //const knex = db.connection().getWriteClient()

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

  public async streamCzml({ request, response }: HttpContext) {
    const { from, to, alertTypes, lat, lon, radius } = await request.validateUsing(
      czmlQueryValidator
    )

    //const knex = db.connection().getWriteClient()

    let query = db
      .from('events')
      .join('alert_types', 'events.alert_type_id', 'alert_types.id')
      .select(
        'events.id',
        'events.title',
        'events.description',
        'events.event_time',
        'events.end_time',
        'events.status',
        'events.level',
        'alert_types.label',
        'alert_types.color',
        'alert_types.icon'
      )
      .select(st.asGeoJSON('events.geom').as('geojson'))
      .select(knex.raw('ST_GeometryType(events.geom) as geom_type'))
      .whereNotNull('events.geom')

    if (from) {
      query = query.where('events.event_time', '>=', from)
    }
    if (to) {
      query = query.where('events.event_time', '<=', to)
    }
    if (alertTypes && alertTypes.length > 0) {
      query = query.whereIn('alert_types.code', alertTypes)
    }

    // Spatial filtering by proximity
    if (lat !== undefined && lon !== undefined) {
      const searchRadius = (radius || 5) * 1000 // Convert km to meters
      const userLocation = st.geomFromText(`POINT(${lon} ${lat})`, 4326)

      query = query.where(
        st.dwithin(
          knex.raw('events.geom::geography'),
          knex.raw('?::geography', [userLocation]),
          searchRadius
        )
      )
    }

    query = query.orderBy('events.event_time', 'asc')

    const events = await query

    // Récupérer les frames spatio-temporels pour les events retournés
    const eventIds = events.map((e: any) => e.id)
    let framesMap = new Map<string, any[]>()

    if (eventIds.length > 0) {
      //const knex = db.connection().getWriteClient()
      const frames = await db
        .from('event_frames')
        .select('event_id', 'frame_time', 'properties')
        .select(st.asGeoJSON('geom').as('geojson'))
        .select(knex.raw('ST_GeometryType(geom) as geom_type'))
        .whereIn('event_id', eventIds)
        .orderBy('frame_time', 'asc')

      for (const frame of frames) {
        const list = framesMap.get(frame.event_id) || []
        list.push(frame)
        framesMap.set(frame.event_id, list)
      }
    }

    // Enrichir chaque event avec ses frames
    const enrichedEvents = events.map((e: any) => ({
      ...e,
      frames: framesMap.get(e.id) || undefined,
    }))

    const czmlService = new CzmlService()
    const czmlPayload = czmlService.buildFromEvents(enrichedEvents)

    return response.json(czmlPayload)
  }
}
