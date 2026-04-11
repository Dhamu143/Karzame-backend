const express = require('express');
const router = express.Router();

const { createGeoFence ,getGeoFences,enableAutoParkAndGeofence,deleteAllFences} = require('../controllers/geoFenceController');

// POST /api/geofence
router.post('/geofence', createGeoFence);
router.get('/geofence/:imei', getGeoFences);
router.post('/auto-secure-all', enableAutoParkAndGeofence);
router.delete('/delete', deleteAllFences);
module.exports = router;