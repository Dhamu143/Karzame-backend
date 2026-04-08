const express = require('express');
const router = express.Router();

const { createGeoFence ,getGeoFences} = require('../controllers/geoFenceController');

// POST /api/geofence
router.post('/geofence', createGeoFence);
router.get('/geofence/:imei', getGeoFences);

module.exports = router;