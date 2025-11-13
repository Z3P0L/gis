import config from './src/config/env.js'
import app from './src/app.js'

app.listen(config.PORT, () => {
	console.log(`API running on http://localhost:${config.PORT}`)
})
