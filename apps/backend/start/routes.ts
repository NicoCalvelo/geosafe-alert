import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Import paresseux (Lazy import) des contrôleurs
const HomeController = () => import('#controllers/home_controller')
const AuthController = () => import('#controllers/auth_controller')
const EventsController = () => import('#controllers/events_controller')
const ProfileController = () => import('#controllers/profile_controller')

router.get('/', [HomeController, 'index'])

// Routes publiques d'authentification
router
  .group(() => {
    router.post('/register', [AuthController, 'register'])
    router.post('/login', [AuthController, 'login'])
  })
  .prefix('api/auth')

// Routes protégées par authentification
router
  .group(() => {
    // Auth
    router.delete('/auth/logout', [AuthController, 'logout'])
    router.get('/auth/me', [AuthController, 'me'])

    // Profile
    router.get('/profile', [ProfileController, 'show'])
    router.put('/profile', [ProfileController, 'update'])

    // Ingestion (protégée)
    router.post('/ingest', [EventsController, 'ingest'])

    // Recherche spatiale
    router.get('/events/nearby', [EventsController, 'nearby'])

    // Flux CZML pour Cesium
    router.get('/events/czml', [EventsController, 'streamCzml'])

    // Health check
    router.get('/health', async ({ response }) => {
      return response.ok({ status: 'healthy' })
    })
  })
  .prefix('api')
  .use(middleware.auth())
