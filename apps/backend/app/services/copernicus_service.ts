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

function buildSquareFootprint(lon: number, lat: number, size: number): GeoJSON {
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

function buildFootprint(alertCode: string, lon: number, lat: number): GeoJSON {
  if (alertCode === 'earthquake') {
    return { type: 'Point', coordinates: [lon, lat] }
  }

  const size = randomBetween(0.05, 0.3)
  return buildSquareFootprint(lon, lat, size)
}

// ── Génération de frames spatio-temporels (déplacement/évolution) ──

// Vitesse et croissance approximatives par type d'aléa (degrés/heure et facteur de taille)
const MOVEMENT_PROFILES: Record<string, { speed: number; growth: number }> = {
  fire: { speed: 0.001, growth: 1.8 }, // se propage lentement, grossit beaucoup
  flood: { speed: 0.005, growth: 1.5 }, // se propage en suivant un axe (ex: rivière), grossit
  storm: { speed: 0.002, growth: 1.1 }, // se déplace vite, taille quasi stable
}

/**
 * Génère une série de frames simulant le déplacement/l'évolution d'un événement dans le temps.
 * Retourne undefined pour les types sans déplacement pertinent (ex: earthquake).
 */
function buildFrames(
  alertCode: string,
  lon: number,
  lat: number,
  startMs: number,
  frameEndMs: number,
  initialSize: number
): CopernicusFrame[] | undefined {
  const profile = MOVEMENT_PROFILES[alertCode]
  if (!profile) return undefined

  const durationHours = Math.max((frameEndMs - startMs) / (60 * 60 * 1000), 1)
  const frameCount = randomInt(10, 16)

  const angle = randomBetween(0, Math.PI * 2)
  const dirLon = Math.cos(angle)
  const dirLat = Math.sin(angle)

  const frames: CopernicusFrame[] = []
  for (let i = 0; i < frameCount; i++) {
    const t = i / (frameCount - 1) // 0 → 1
    const timeMs = startMs + t * (frameEndMs - startMs)
    const traveled = profile.speed * durationHours * t
    const frameLon = lon + dirLon * traveled
    const frameLat = lat + dirLat * traveled
    const size = initialSize * (1 + (profile.growth - 1) * t)

    frames.push({
      Time: new Date(timeMs).toISOString(),
      GeoFootprint: buildSquareFootprint(frameLon, frameLat, size),
      Properties: { step: i },
    })
  }

  return frames
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

      const initialSize = randomBetween(0.05, 0.3)
      const frameEndMs = isOngoing ? now : endMs!
      const frames = buildFrames(def.code, lon, lat, startMs, frameEndMs, initialSize)

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
        GeoFootprint:
          def.code === 'earthquake'
            ? buildFootprint(def.code, lon, lat)
            : buildSquareFootprint(lon, lat, initialSize),
        Attributes: { simulated: true, confidence: Math.round(randomBetween(60, 99)) / 100 },
        Frames: frames,
      })
    }

    return events
  }
}
