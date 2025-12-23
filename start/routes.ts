import router from '@adonisjs/core/services/router'

// Import paresseux (Lazy import) du contrôleur
const HomeController = () => import('#controllers/home_controller')
const EventsController = () => import('#controllers/events_controller')

router.get('/', [HomeController, 'index'])

router
  .group(() => {
    // Route pour déclencher l'ingestion (souvent protégée, mais public pour le TP)
    router.post('/ingest', [EventsController, 'ingest'])
    // Route pour rechercher les événements proches
    router.get('/events/nearby', [EventsController, 'nearby'])
  })
  .prefix('api')
