import vine from '@vinejs/vine'

export const searchEventValidator = vine.compile(
  vine.object({
    lat: vine.number().range([-90, 90]),
    lon: vine.number().range([-180, 180]),
    // Rayon en mètres (ex: 10000 pour 10km), optionnel
    radius: vine.number().min(0).optional()
  })
)