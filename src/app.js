import express from 'express'
import geoRouter from './routes/geo.js'

const app = express()

app.use(express.json())
app.use('/geo', geoRouter)

export default app
