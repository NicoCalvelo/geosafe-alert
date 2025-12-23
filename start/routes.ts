import router from '@adonisjs/core/services/router'

// Import paresseux (Lazy import) du contrôleur
const HomeController = () => import('#controllers/home_controller')
const EventsController = () => import('#controllers/events_controller')

router.get('/', [HomeController, 'index'])

router.get('/events', [EventsController, 'index'])
