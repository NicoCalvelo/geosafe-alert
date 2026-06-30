import vine from '@vinejs/vine'

export const updateProfileValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(1).optional(),
    locationAddress: vine.string().trim().optional(),
    locationLat: vine.number().range([-90, 90]).optional(),
    locationLng: vine.number().range([-180, 180]).optional(),
  })
)
