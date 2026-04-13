const express = require('express')
const cors = require('cors')

const vehicleRoutes = require('./routes/vehicleRoutes')
const geoFenceRoutes = require('./routes/geoFenceRoutes');
const relayRoutes = require('./routes/relayRoutes');
const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/vehicles', vehicleRoutes);
app.use('/api', geoFenceRoutes);
app.use('/api', relayRoutes);

module.exports = app
