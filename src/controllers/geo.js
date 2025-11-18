import config from '../config/env.js'
import { getRequest } from '../services/request.js'

export const getGeoData = async (req, res) => {
	const { term, city, country, limit } = req.query

	if (!term) {
		return res.status(400).json({ error: 'The parameter "term" is required.' })
	}

	try {
		const params = {
			q: `${term}, ${city || ''}, ${country || ''}`.trim(),
			format: 'json',
			addressdetails: 1,
		}

		if (limit) params.limit = limit

		const rawResults = await getRequest(config.OPENSTREET_BASE_URL, params)

		const simplified = rawResults.map(item => ({
			lat: item.lat,
			lon: item.lon,
			name: item.address?.neighbourhood || item.address?.suburb || item.address?.road || item.display_name?.split(',')[0],
			city: item.address?.city || item.address?.town || item.address?.village,
			state: item.address?.state,
			country: item.address?.country,
			postcode: item.address?.postcode,
			display_name: item.display_name
		}))

		res.json({ count: simplified.length, results: simplified })
	} catch (err) {
		res.status(500).json({ error: err.toString() })
	}
}

export const getDistance = async (req, res) => {
	const { lat1, lon1, lat2, lon2, from, to } = req.query

	const toRadians = deg => (deg * Math.PI) / 180
	const haversine = (a, b) => {
		const R = 6371
		const dLat = toRadians(b.lat - a.lat)
		const dLon = toRadians(b.lon - a.lon)
		const lat1 = toRadians(a.lat)
		const lat2 = toRadians(b.lat)
		const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
		return 2 * R * Math.asin(Math.sqrt(h))
	}

	const fetchCoords = async (query) => {
		const params = { q: query, format: 'json', limit: 1 }
		const [result] = await getRequest(config.OPENSTREET_BASE_URL, params)
		if (!result) throw new Error(`Location not found for "${query}".`)
		return { lat: parseFloat(result.lat), lon: parseFloat(result.lon), name: result.display_name }
	}

	try {
		let pointA, pointB

		if (lat1 && lon1 && lat2 && lon2) {
			pointA = { lat: parseFloat(lat1), lon: parseFloat(lon1), name: 'Point A' }
			pointB = { lat: parseFloat(lat2), lon: parseFloat(lon2), name: 'Point B' }
		} else if (from && to) {
			[pointA, pointB] = await Promise.all([fetchCoords(from), fetchCoords(to)])
		} else {
			return res.status(400).json({ error: 'You must provide either lat/lon pairs or from/to names.' })
		}

		const distance = haversine(pointA, pointB)
		res.json({
			from: pointA.name,
			to: pointB.name,
			distance_km: parseFloat(distance.toFixed(2))
		})
	} catch (err) {
		res.status(500).json({ error: err.toString() })
	}
}
