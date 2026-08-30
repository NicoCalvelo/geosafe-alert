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
    positions:
      | { cartographicDegrees: number[] }
      | { interval: string; cartographicDegrees: number[] }[]
    material: {
      solidColor: {
        color:
          | { rgba: number[] }
          | {
              epoch: string
              rgba: number[]
              interpolationAlgorithm: string
              interpolationDegree: number
            }
      }
    }
    height: number
    extrudedHeight?: number | { interval: string; number: number }[]
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

export interface EventFrameRow {
  frame_time: string | Date
  geojson: string
  geom_type?: string
  properties?: Record<string, any>
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
  frames?: EventFrameRow[]
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
   * Si des frames spatio-temporels sont disponibles, génère des intervals CZML
   * pour animer le polygone dans le temps.
   */
  private eventToPacket(event: EventRow, globalStop: string): CzmlPacket | null {
    const geojson = JSON.parse(event.geojson)
    const rgba = hexToRgba(event.color ?? '#ffffff')
    const rgbaFill = hexToRgba(event.color ?? '#ffffff', 100)

    // Availability
    const eventStart = event.event_time ? toDateTime(event.event_time).toISO()! : globalStop
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
      // Si des frames sont disponibles, générer des intervals temporels
      if (event.frames && event.frames.length > 1) {
        const { intervals, color } = this.buildFrameData(
          event.frames,
          eventEnd,
          rgbaFill,
          eventStart
        )

        packet.polygon = {
          positions: intervals,
          material: { solidColor: { color } },
          height: 0,
          extrudedHeight: (event.level ?? 1) * 500,
          outline: true,
          outlineColor: { rgba },
        }
      } else {
        // Pas de frames → polygone statique (comportement original)
        const ring = type === 'MultiPolygon' ? geojson.coordinates[0][0] : geojson.coordinates[0]
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
      }
    } else {
      // Géométrie non supportée (LineString, etc.) — on ignore pour l'instant
      return null
    }

    return packet
  }

  /**
   * Construit les données d'animation pour un polygone multi-frame :
   * - intervals CZML pour les positions (switch discret par interval)
   * - color échantillonnée avec fade-out/fade-in autour de chaque transition
   *   (alpha → 0 au moment du switch, invisible = transition douce)
   */
  private buildFrameData(
    frames: EventFrameRow[],
    eventEnd: string,
    fillRgba: number[],
    eventStart: string
  ): {
    intervals: { interval: string; cartographicDegrees: number[] }[]
    color: {
      epoch: string
      rgba: number[]
      interpolationAlgorithm: string
      interpolationDegree: number
    }
  } {
    const intervals: { interval: string; cartographicDegrees: number[] }[] = []
    const [r, g, b, a] = fillRgba
    const epoch = toDateTime(eventStart)
    const colorSamples: number[] = []
    const frameTimes = frames.map((f) => toDateTime(f.frame_time))

    // Calculer fadeSec proportionnel à l'écart minimum entre frames
    // (10 % de l'intervalle le plus court, plafonné à 10 min)
    const gapsSec = frameTimes.slice(1).map((t, i) => t.diff(frameTimes[i], 'seconds').seconds)
    const minGap = Math.min(...gapsSec)
    const fadeSec = Math.min(minGap * 0.1, 600)

    // Premier keyframe : pleine opacité au début
    colorSamples.push(0, r, g, b, a)

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i]
      const frameGeojson = JSON.parse(frame.geojson)

      const start = frameTimes[i].toISO()!
      const end = i < frames.length - 1 ? frameTimes[i + 1].toISO()! : eventEnd

      // Positions du polygone pour cet interval
      const gtype = frame.geom_type?.replace('ST_', '') ?? frameGeojson.type
      const ring =
        gtype === 'MultiPolygon' ? frameGeojson.coordinates[0][0] : frameGeojson.coordinates[0]

      const flatCoords: number[] = []
      for (const coord of ring) {
        flatCoords.push(coord[0], coord[1], coord[2] ?? 0)
      }

      intervals.push({ interval: `${start}/${end}`, cartographicDegrees: flatCoords })

      // Keyframes de fondu autour de chaque frontière de transition
      if (i < frames.length - 1) {
        const transitionSec = frameTimes[i + 1].diff(epoch, 'seconds').seconds
        colorSamples.push(transitionSec - fadeSec, r, g, b, a) // avant : visible
        colorSamples.push(transitionSec, r, g, b, 0) // transition : transparent
        colorSamples.push(transitionSec + fadeSec, r, g, b, a) // après : visible
      }
    }

    // Dernier keyframe : pleine opacité à la fin
    const endSec = toDateTime(eventEnd).diff(epoch, 'seconds').seconds
    colorSamples.push(endSec, r, g, b, a)

    return {
      intervals,
      color: {
        epoch: epoch.toISO()!,
        rgba: colorSamples,
        interpolationAlgorithm: 'LINEAR',
        interpolationDegree: 1,
      },
    }
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
    Number.parseInt(fullHex.substring(0, 2), 16),
    Number.parseInt(fullHex.substring(2, 4), 16),
    Number.parseInt(fullHex.substring(4, 6), 16),
    alpha,
  ]
}
