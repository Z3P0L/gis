import express from 'express'
import { getDistance, getGeoData } from '../controllers/geo.js'

const router = express.Router()

router.get('/', getGeoData)
router.get('/distance', getDistance)

export default router
