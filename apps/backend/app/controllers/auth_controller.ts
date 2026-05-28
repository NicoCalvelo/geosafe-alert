import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { loginValidator, registerValidator } from '#validators/auth'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const data = await request.validateUsing(registerValidator)

    const user = await User.create({
      email: data.email,
      password: data.password,
      full_name: data.fullName ?? null,
    })

    const token = await User.accessTokens.create(user)

    return response.created({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      token: token.toJSON(),
    })
  }

  async login({ request, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user)

    return response.ok({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      token: token.toJSON(),
    })
  }

  async logout({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const token = auth.use('api').user!.currentAccessToken

    await User.accessTokens.delete(user, token.identifier)

    return response.ok({ message: 'Logged out' })
  }

  async me({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()

    return response.ok({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    })
  }
}
