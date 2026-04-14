import { DateTime } from 'luxon'

// ── Types CZML ──────────────────────────────────────────────

interface CzmlDocument {
  id: string
  name: string
  version: string
  clock: {
    interval: string
    currentTime: string
    multiplier: number
    range: string
    step: string
  }
}

interface CzmlPacket {
  id: string
  name?: string
  description?: string
  availability?: string
  point?: {
    color: { rgba: number[] }
    pixelSize: number
    outlineColor?: { rgba: number[] }
    outlineWidth?: number
    heightReference?: string
  }
  polygon?: {
    positions: { cartographicDegrees: number[] }
    material: { solidColor: { color: { rgba: number[] } } }
    height: number
    extrudedHeight?: number
    outline: boolean
    outlineColor?: { rgba: number[] }
    heightReference?: string
  }
  position?: { cartographicDegrees: number[] }
  label?: {
    text: string
    font: string
    fillColor: { rgba: number[] }
    outlineColor: { rgba: number[] }
    outlineWidth: number
    style: string
    verticalOrigin: string
    pixelOffset: { cartesian2: number[] }
    heightReference?: string
  }
}

/**
 * Représente une ligne d'événement jointe avec alert_types,
 * telle que retournée par la requête PostGIS.
 */
export interface EventRow {
  id: string
  title: string | null
  description: string | null
  event_time: string | Date | null
  end_time: string | Date | null
  status: string | null
  level: number | null
  label: string | null
  color: string | null
  icon: string | null
  geojson: string // ST_AsGeoJSON result
  geom_type: string // ST_GeometryType result (e.g. 'ST_Point', 'ST_Polygon')
}

// ── Service ─────────────────────────────────────────────────

export default class CzmlService {
  /**
   * Construit un tableau CZML complet à partir d'un tableau d'événements.
   * Le premier élément est toujours le paquet "document" (clock global).
   */
  buildFromEvents(events: EventRow[]): (CzmlDocument | CzmlPacket)[] {
    const packets: (CzmlDocument | CzmlPacket)[] = []

    // 1. Calculer la plage temporelle globale
    const { start, stop } = this.computeTimeRange(events)

    // 2. Paquet document
    packets.push({
      id: 'document',
      name: 'GeoSafe Alerts',
      version: '1.0',
      clock: {
        interval: `${start}/${stop}`,
        currentTime: start,
        multiplier: 60,
        range: 'LOOP_STOP',
        step: 'SYSTEM_CLOCK_MULTIPLIER',
      },
    })

    // 3. Un paquet par événement
    for (const event of events) {
      const packet = this.eventToPacket(event, stop)
      if (packet) {
        packets.push(packet)
      }
    }

    return packets
  }

  /**
   * Calcule l'intervalle temporel min/max sur l'ensemble des événements.
   */
  private computeTimeRange(events: EventRow[]): { start: string; stop: string } {
    let earliest: DateTime | null = null
    let latest: DateTime | null = null

    for (const e of events) {
      if (e.event_time) {
        const t = toDateTime(e.event_time)
        if (t.isValid && (!earliest || t < earliest)) earliest = t
      }
      if (e.end_time) {
        const t = toDateTime(e.end_time)
        if (t.isValid && (!latest || t > latest)) latest = t
      } else if (e.event_time) {
        // Si pas de end_time, on utilise event_time + 24h comme borne max
        const t = toDateTime(e.event_time).plus({ hours: 24 })
        if (t.isValid && (!latest || t > latest)) latest = t
      }
    }

    const now = DateTime.utc()
    return {
      start: (earliest ?? now.minus({ days: 7 })).toISO()!,
      stop: (latest ?? now).toISO()!,
    }
  }

  /**
   * Convertit un événement (ligne jointe) en paquet CZML.
   */
  private eventToPacket(event: EventRow, globalStop: string): CzmlPacket | null {
    const geojson = JSON.parse(event.geojson)
    const rgba = hexToRgba(event.color ?? '#ffffff')
    const rgbaFill = hexToRgba(event.color ?? '#ffffff', 100)

    // Availability
    const eventStart = event.event_time
      ? toDateTime(event.event_time).toISO()!
      : globalStop
    const eventEnd = event.end_time
      ? toDateTime(event.end_time).toISO()!
      : event.status === 'active'
        ? globalStop
        : toDateTime(event.event_time ?? globalStop)
            .plus({ hours: 24 })
            .toISO()!

    const availability = `${eventStart}/${eventEnd}`

    const type = event.geom_type?.replace('ST_', '') ?? geojson.type

    const packet: CzmlPacket = {
      id: event.id,
      name: event.title ?? 'Unknown event',
      description: this.buildDescription(event),
      availability,
    }

    if (type === 'Point' || type === 'MultiPoint') {
      const coords = geojson.coordinates // [lon, lat] ou [lon, lat, alt]
      packet.position = {
        cartographicDegrees: [coords[0], coords[1], coords[2] ?? 0],
      }
      packet.point = {
        color: { rgba },
        pixelSize: 12 + (event.level ?? 1) * 2,
        outlineColor: { rgba: [255, 255, 255, 200] },
        outlineWidth: 2,
        heightReference: 'CLAMP_TO_GROUND',
      }
      packet.label = {
        text: event.title ?? '',
        font: '12pt sans-serif',
        fillColor: { rgba: [255, 255, 255, 255] },
        outlineColor: { rgba: [0, 0, 0, 200] },
        outlineWidth: 2,
        style: 'FILL_AND_OUTLINE',
        verticalOrigin: 'BOTTOM',
        pixelOffset: { cartesian2: [0, -20] },
        heightReference: 'CLAMP_TO_GROUND',
      }
    } else if (type === 'Polygon' || type === 'MultiPolygon') {
      const ring =
        type === 'MultiPolygon'
          ? geojson.coordinates[0][0] // Premier polygone, anneau extérieur
          : geojson.coordinates[0] // Anneau extérieur
      const flatCoords: number[] = []
      for (const coord of ring) {
        flatCoords.push(coord[0], coord[1], coord[2] ?? 0)
      }

      packet.polygon = {
        positions: { cartographicDegrees: flatCoords },
        material: { solidColor: { color: { rgba: rgbaFill } } },
        height: 0,
        extrudedHeight: (event.level ?? 1) * 500,
        outline: true,
        outlineColor: { rgba },
        heightReference: 'CLAMP_TO_GROUND',
      }
    } else {
      // Géométrie non supportée (LineString, etc.) — on ignore pour l'instant
      return null
    }

    return packet
  }

  /**
   * Construit une description HTML pour le popup Cesium.
   */
  private buildDescription(event: EventRow): string {
    const parts = [
      `<strong>${event.label ?? 'Alert'}</strong>`,
      event.description ?? '',
      `<br/>Status: <em>${event.status ?? 'unknown'}</em>`,
      event.level !== null ? `<br/>Level: ${event.level}/5` : '',
    ]
    return parts.filter(Boolean).join('')
  }
}

// ── Helpers ─────────────────────────────────────────────────

/**
 * Convertit une couleur hexadécimale en tableau RGBA [r, g, b, a].
 * @param hex - Couleur au format '#rrggbb' ou '#rgb'
 * @param alpha - Valeur alpha 0-255 (défaut: 255)
 */
/**
 * Convertit une valeur date (Date JS ou string ISO) en DateTime Luxon.
 */
function toDateTime(value: string | Date): DateTime {
  if (value instanceof Date) {
    return DateTime.fromJSDate(value, { zone: 'utc' })
  }
  return DateTime.fromISO(value, { zone: 'utc' })
}

function hexToRgba(hex: string, alpha: number = 255): number[] {
  const clean = hex.replace('#', '')
  const fullHex =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean

  return [
    parseInt(fullHex.substring(0, 2), 16),
    parseInt(fullHex.substring(2, 4), 16),
    parseInt(fullHex.substring(4, 6), 16),
    alpha,
  ]
}
