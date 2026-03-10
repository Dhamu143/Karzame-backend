const express = require('express')
const cors = require('cors')

const vehicleRoutes = require('./routes/vehicleRoutes')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/vehicles', vehicleRoutes)

module.exports = app
