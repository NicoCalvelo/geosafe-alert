// ── Types pour les données mock ─────────────────────────────

interface CopernicusFrame {
  Time: string
  GeoFootprint: GeoJSON
  Properties?: Record<string, any>
}

interface GeoJSON {
  type: 'Point' | 'Polygon' | 'MultiPolygon'
  coordinates: any
}

export interface CopernicusEvent {
  Id: string
  Name: string
  AlertCode: string
  Description: string
  ContentDate: { Start: string; End: string | null }
  Status: string
  Level: number
  GeoFootprint: GeoJSON
  Attributes: Record<string, any>
  Frames?: CopernicusFrame[]
}

// ── Génération procédurale de données fictives ──────────────

const FRANCE_BBOX = { minLon: -5, maxLon: 10, minLat: 41, maxLat: 51.5 }
const EVENT_COUNT = 200
const LOOKBACK_DAYS = 7

const ALERT_DEFINITIONS: { code: string; names: string[] }[] = [
  { code: 'fire', names: ['Wildfire', 'Forest fire', 'Brush fire'] },
  { code: 'flood', names: ['River flooding', 'Flash flood', 'Coastal flooding'] },
  { code: 'earthquake', names: ['Earthquake', 'Seismic event'] },
  { code: 'storm', names: ['Severe storm', 'Thunderstorm', 'Windstorm'] },
]

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1))
}

function pickRandom<T>(list: T[]): T {
  return list[randomInt(0, list.length - 1)]
}

function buildFootprint(alertCode: string, lon: number, lat: number): GeoJSON {
  if (alertCode === 'earthquake') {
    return { type: 'Point', coordinates: [lon, lat] }
  }

  const size = randomBetween(0.05, 0.3)
  const half = size / 2
  return {
    type: 'Polygon',
    coordinates: [
      [
        [lon - half, lat - half],
        [lon + half, lat - half],
        [lon + half, lat + half],
        [lon - half, lat + half],
        [lon - half, lat - half],
      ],
    ],
  }
}

export default class CopernicusService {
  public async fetchLatestEvents(): Promise<CopernicusEvent[]> {
    const now = Date.now()
    const events: CopernicusEvent[] = []

    for (let i = 0; i < EVENT_COUNT; i++) {
      const def = pickRandom(ALERT_DEFINITIONS)
      const lon = randomBetween(FRANCE_BBOX.minLon, FRANCE_BBOX.maxLon)
      const lat = randomBetween(FRANCE_BBOX.minLat, FRANCE_BBOX.maxLat)

      const startMs = now - randomBetween(0, LOOKBACK_DAYS * 24 * 60 * 60 * 1000)
      const isOngoing = Math.random() < 0.3
      const endMs = isOngoing ? null : startMs + randomBetween(1, 48) * 60 * 60 * 1000

      events.push({
        Id: `sim-${def.code}-${i}-${Math.round(startMs)}`,
        Name: `${pickRandom(def.names)} (simulated)`,
        AlertCode: def.code,
        Description: `${pickRandom(def.names)} detected near [${lon.toFixed(2)}, ${lat.toFixed(2)}]`,
        ContentDate: {
          Start: new Date(startMs).toISOString(),
          End: endMs ? new Date(endMs).toISOString() : null,
        },
        Status: isOngoing ? 'active' : 'ended',
        Level: randomInt(1, 5),
        GeoFootprint: buildFootprint(def.code, lon, lat),
        Attributes: { simulated: true, confidence: Math.round(randomBetween(60, 99)) / 100 },
      })
    }

    return events
  }
}
