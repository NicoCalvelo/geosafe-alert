import type { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  // On ajoute 'request' dans les accolades (Destructuration du Context)
  async index({ request, response }: HttpContext) {
    // 1. Récupérer une info envoyée par l'utilisateur (ex: ?token=XYZ)
    // Le deuxième argument est une valeur par défaut si le paramètre est absent.
    const userToken = request.input('token', 'guest_access')

    // 2. Logique simple (simulée)
    const accessStatus = userToken === 'SECRET_KEY' ? 'admin' : 'visitor'

    // 3. On renvoie la donnée dynamique
    return response.ok({
      status: 'online',
      version: '1.0.0',
      service: 'GeoSafe API',
      whoami: accessStatus, // Le résultat de notre logique
      received_token: userToken, // Preuve qu'on a bien lu l'entrée
    })
  }
}
