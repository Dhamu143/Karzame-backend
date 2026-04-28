const express = require('express')
const cors = require('cors')

const vehicleRoutes = require('./routes/vehicleRoutes')
const geoFenceRoutes = require('./routes/geoFenceRoutes');
const relayRoutes = require('./routes/relayRoutes');
const notificationRoutes = require("./routes/notificationRoutes");
const premiumUserRoutes = require("./routes/premiumUserRoutes");
const planRoutes = require("./routes/planRoutes");
const notification  = require('./routes/notification');
const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/vehicles', vehicleRoutes);
app.use('/api', geoFenceRoutes);
app.use('/api', relayRoutes);
app.use("/api", notificationRoutes);
app.use('/api/premium-users', premiumUserRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/notifications', notification);
module.exports = app
