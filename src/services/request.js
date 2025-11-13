import https from 'https'

/**
 * Generic HTTPS GET request for OpenStreetMap or other APIs.
 * @param {string} baseUrl - The base URL (without parameters).
 * @param {object} params - Query parameters (object).
 * @param {object} options - Optional request headers and settings.
 * @returns {Promise<object>} - Parsed JSON response.
 */
export const getRequest = (baseUrl, params = {}, options = {}) => {
	return new Promise((resolve, reject) => {
		const query = new URLSearchParams(params).toString()
		const url = `${baseUrl}?${query}`

		const headers = {
			'User-Agent': 'GISApp/1.0 (contact: dalopezal19@gmail.com)',
			'Accept-Language': 'en',
			...options.headers
		}

		https.get(url, { headers: headers }, (response) => {
			let data = ''
			response.on('data', (chunk) => (data += chunk))
			response.on('end', () => {
				try {
					const parsed = JSON.parse(data)
					resolve(parsed)
				} catch (err) {
					reject('Error parsing response: ' + err.message)
				}
			})
		}).on('error', (err) => reject('Request error: ' + err.message))
	})
}
