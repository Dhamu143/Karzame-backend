require('dotenv').config()

const app = require('./src/app')
const connectDB = require('./src/config/db')
const { generateToken } = require('./src/services/gpsTokenManager')

const PORT = process.env.PORT || 5000

async function startServer() {
	try {
		await connectDB()

		await generateToken()

		setInterval(
			async () => {
				await generateToken()
			},
			90 * 60 * 1000,
		)

		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`)
		})
	} catch (error) {
		console.error('Server startup error:', error)
		process.exit(1)
	}
}

startServer()
