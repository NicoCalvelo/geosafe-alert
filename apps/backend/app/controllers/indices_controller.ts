import db from '@adonisjs/lucid/services/db'
import IndexType from '#models/index_type'
import type { HttpContext } from '@adonisjs/core/http'
import IndicesService from '#services/indices_service'
import { indexAtValidator } from '#validators/search_index'
import { st } from '#services/postgis_service'

export default class IndicesController {
  public async types({ response }: HttpContext) {
    const types = await IndexType.query()
      .select('id', 'code', 'label', 'icon', 'color')
      .orderBy('label', 'asc')

    return response.ok(types)
  }

  public async ingest({ response }: HttpContext) {
    const service = new IndicesService()
    const result = await service.regenerateAll()

    return response.ok({
      message: `${result.zones} zones et ${result.values} valeurs d'indices générées avec succès.`,
    })
  }

  public async at({ request, response }: HttpContext) {
    const { lat, lon } = await request.validateUsing(indexAtValidator)

    const userLocation = st.geomFromText(`POINT(${lon} ${lat})`, 4326)

    const results = await db
      .from('index_zones')
      .join('index_values', 'index_values.zone_id', 'index_zones.id')
      .join('index_types', 'index_types.id', 'index_values.index_type_id')
      .select(
        'index_types.code',
        'index_types.label',
        'index_types.icon',
        'index_types.color',
        'index_values.value',
        'index_values.level'
      )
      .select(st.asGeoJSON('index_zones.geom').as('zone'))
      .where(st.within(userLocation, 'index_zones.geom'))
      .orderBy('index_types.label', 'asc')

    return response.ok(results)
  }

  public async grid({ response }: HttpContext) {
    const rows = await db
      .from('index_zones')
      .join('index_values', 'index_values.zone_id', 'index_zones.id')
      .join('index_types', 'index_types.id', 'index_values.index_type_id')
      .select(
        'index_zones.id as zone_id',
        'index_zones.cell_x',
        'index_zones.cell_y',
        'index_types.code',
        'index_types.label',
        'index_types.icon',
        'index_types.color',
        'index_values.value',
        'index_values.level'
      )
      .select(st.asGeoJSON('index_zones.geom').as('geom'))
      .orderBy('index_zones.id')

    // Regrouper les lignes plates (zone x indice) par zone
    const zonesMap = new Map<string, any>()
    for (const row of rows) {
      if (!zonesMap.has(row.zone_id)) {
        zonesMap.set(row.zone_id, {
          id: row.zone_id,
          cellX: row.cell_x,
          cellY: row.cell_y,
          zone: JSON.parse(row.geom),
          values: [],
        })
      }
      zonesMap.get(row.zone_id).values.push({
        code: row.code,
        label: row.label,
        icon: row.icon,
        color: row.color,
        value: row.value,
        level: row.level,
      })
    }

    return response.ok(Array.from(zonesMap.values()))
  }
}
