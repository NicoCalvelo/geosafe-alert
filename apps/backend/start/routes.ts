import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Import paresseux (Lazy import) des contrôleurs
const HomeController = () => import('#controllers/home_controller')
const AuthController = () => import('#controllers/auth_controller')
const EventsController = () => import('#controllers/events_controller')
const ProfileController = () => import('#controllers/profile_controller')
const GeocodeController = () => import('#controllers/geocode_controller')
const IndicesController = () => import('#controllers/indices_controller')
const ZoneSubscriptionsController = () => import('#controllers/zone_subscriptions_controller')
const ZoneAlertsController = () => import('#controllers/zone_alerts_controller')

router.get('/', [HomeController, 'index'])

// Health check
router.get('/health', async ({ response }) => {
  return response.ok({ status: 'healthy' })
})

//Readness
router.get('/read', async ({ response }) => {
  return response.ok({ status: 'ok' })
})

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

    // Types d'alerte disponibles
    router.get('/alert-types', [EventsController, 'alertTypes'])

    // Recherche spatiale
    router.get('/events/nearby', [EventsController, 'nearby'])

    // Géocodage (autocomplete adresses)
    router.get('/geocode/autocomplete', [GeocodeController, 'autocomplete'])

    // Flux CZML pour Cesium
    router.get('/events/czml', [EventsController, 'streamCzml'])

    // Indices de risque (sécheresse, chaleur, vent, etc.)
    router.post('/indices/ingest', [IndicesController, 'ingest'])
    router.get('/indices/types', [IndicesController, 'types'])
    router.get('/indices/at', [IndicesController, 'at'])
    router.get('/indices/zones/:zoneId', [IndicesController, 'byZone'])
    router.get('/indices/grid', [IndicesController, 'grid'])

    // Abonnements à une zone de la grille
    router.get('/zones/subscriptions', [ZoneSubscriptionsController, 'mine'])
    router.post('/zones/:zoneId/subscribe', [ZoneSubscriptionsController, 'subscribe'])
    router.delete('/zones/:zoneId/subscribe', [ZoneSubscriptionsController, 'unsubscribe'])

    // Alertes déclenchées sur les zones suivies
    router.get('/zone-alerts', [ZoneAlertsController, 'list'])
    router.post('/zone-alerts/check', [ZoneAlertsController, 'check'])
  })
  .prefix('api')
  .use(middleware.auth())
