const express = require('express')
const cors = require('cors')

const vehicleRoutes = require('./routes/vehicleRoutes')
const geoFenceRoutes = require('./routes/geoFenceRoutes');
const relayRoutes = require('./routes/relayRoutes');
const notificationRoutes = require("./routes/notificationRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const premiumUserRoutes = require("./routes/premiumUserRoutes");
const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/vehicles', vehicleRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api', geoFenceRoutes);
app.use('/api', relayRoutes);
app.use("/api", notificationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/premium-users', premiumUserRoutes);

module.exports = app
