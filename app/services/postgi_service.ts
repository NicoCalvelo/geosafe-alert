import knexPostgis from 'knex-postgis'
import db from '@adonisjs/lucid/services/db'

// On initialise l'extension PostGIS avec la connexion de Lucid
// "st" est la convention standard pour "Spatial Type" ou "Spatial Tools"
export const st = knexPostgis(db.connection().getWriteClient())