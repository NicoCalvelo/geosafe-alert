import db from '@adonisjs/lucid/services/db'
import IndexType from '#models/index_type'
import { st } from '#services/postgis_service'

const knex = db.connection().getWriteClient()

// Bounding box couvrant la France métropolitaine (données fictives)
const FRANCE_BBOX = { minLon: -5, maxLon: 10, minLat: 41, maxLat: 51.5 }
const CELL_SIZE_DEG = 1

// Ajouter un indice = ajouter une entrée ici, aucune migration requise
export const INDEX_TYPE_DEFINITIONS = [
  { code: 'drought', label: 'Drought', icon: 'sun', color: '#c2a14d' },
  { code: 'heat', label: 'Heat', icon: 'thermometer', color: '#ff4500' },
  { code: 'wind', label: 'Wind', icon: 'wind', color: '#2e8b8b' },
  { code: 'fire_risk', label: 'Fire risk', icon: 'flame', color: '#ff7f00' },
  { code: 'air_pollution', label: 'Air pollution', icon: 'cloud', color: '#808080' },
  { code: 'storm', label: 'Storm', icon: 'cloud-lightning', color: '#8b00ff' },
  { code: 'seismic', label: 'Seismic', icon: 'activity', color: '#8b0000' },
  { code: 'snow', label: 'Snow', icon: 'snowflake', color: '#87ceeb' },
]

function levelFromValue(value: number): string {
  if (value >= 75) return 'extreme'
  if (value >= 50) return 'high'
  if (value >= 25) return 'medium'
  return 'low'
}

export default class IndicesService {
  public async regenerateAll() {
    // 1. Types de référence (upsert, ne dépend pas d'une migration pour être étendu)
    const indexTypes = []
    for (const def of INDEX_TYPE_DEFINITIONS) {
      indexTypes.push(await IndexType.updateOrCreate({ code: def.code }, def))
    }

    // 2. Reset complet des zones (cascade sur index_values)
    await knex.raw('TRUNCATE TABLE index_zones CASCADE')

    // 3. Génération de la grille de zones sur la France
    const zoneRows: { cell_x: number; cell_y: number; geom: any }[] = []
    let cellX = 0
    for (let lon = FRANCE_BBOX.minLon; lon < FRANCE_BBOX.maxLon; lon += CELL_SIZE_DEG, cellX++) {
      let cellY = 0
      for (let lat = FRANCE_BBOX.minLat; lat < FRANCE_BBOX.maxLat; lat += CELL_SIZE_DEG, cellY++) {
        const lon2 = lon + CELL_SIZE_DEG
        const lat2 = lat + CELL_SIZE_DEG
        const wkt = `POLYGON((${lon} ${lat}, ${lon2} ${lat}, ${lon2} ${lat2}, ${lon} ${lat2}, ${lon} ${lat}))`

        zoneRows.push({ cell_x: cellX, cell_y: cellY, geom: st.geomFromText(wkt, 4326) })
      }
    }

    const insertedZones = await knex('index_zones').insert(zoneRows).returning('id')

    // 4. Valeur aléatoire fictive par zone et par type d'indice
    const valueRows: { zone_id: string; index_type_id: number; value: number; level: string }[] =
      []
    for (const zone of insertedZones) {
      for (const type of indexTypes) {
        const value = Math.round(Math.random() * 10000) / 100
        valueRows.push({
          zone_id: zone.id,
          index_type_id: type.id,
          value,
          level: levelFromValue(value),
        })
      }
    }

    await knex('index_values').insert(valueRows)

    return { types: indexTypes.length, zones: insertedZones.length, values: valueRows.length }
  }
}
