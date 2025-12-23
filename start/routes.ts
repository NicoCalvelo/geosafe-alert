import router from '@adonisjs/core/services/router'

// Import paresseux (Lazy import) du contrôleur
const HomeController = () => import( '#controllers/home_controller')

router.get('/', [HomeController, 'index'])
