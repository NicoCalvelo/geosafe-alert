import vine from '@vinejs/vine'

export const indexAtValidator = vine.compile(
  vine.object({
    lat: vine.number().range([-90, 90]),
    lon: vine.number().range([-180, 180]),
  })
)
