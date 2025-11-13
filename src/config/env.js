import fs from 'fs'

const envFile = fs.readFileSync('.env', 'utf8')
const env = {}

envFile.split('\n').forEach(line => {
	const [key, value] = line.split('=')
	if (key && value) env[key.trim()] = value.trim()
})

export default {
	PORT: env.PORT || 3000,
	OPENSTREET_BASE_URL: env.OPENSTREET_BASE_URL
}
