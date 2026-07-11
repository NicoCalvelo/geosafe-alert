import vine from '@vinejs/vine'

export const searchEventValidator = vine.compile(
  vine.object({
    lat: vine.number().range([-90, 90]),
    lon: vine.number().range([-180, 180]),
    // Rayon en mètres (ex: 10000 pour 10km), optionnel
    radius: vine.number().min(0).optional(),
  })
)

export const czmlQueryValidator = vine.compile(
  vine.object({
    // Plage temporelle (ISO 8601)
    from: vine.string().optional(),
    to: vine.string().optional(),
    // Filtrage par codes de type d'alerte (ex: ['fire', 'flood'])
    alertTypes: vine.array(vine.string()).optional(),
    // Filtrage spatial (lat, lon, radius en km)
    lat: vine.number().range([-90, 90]).optional(),
    lon: vine.number().range([-180, 180]).optional(),
    radius: vine.number().min(0).optional(), // radius en km, default 5
  })
)
