// const express = require('express');
// const router = express.Router();

// const { createGeoFence ,getGeoFences,enableAutoParkAndGeofence,deleteAllFences} = require('../controllers/geoFenceController');

// router.post('/geofence', createGeoFence);
// router.get('/geofence/:imei', getGeoFences);
// router.post('/auto-secure-all', enableAutoParkAndGeofence);
// router.delete('/delete', deleteAllFences);
// module.exports = router;    

const express = require('express');
const router = express.Router();

const {
  createGeoFence,
  getGeoFences,
  enableAutoParkAndGeofence,
  deleteAllFences,
  updateVehicleSettings,  
  getVehicleSettings,  
} = require('../controllers/geoFenceController');

router.post('/geofence', createGeoFence);
router.get('/geofence/:imei', getGeoFences);
router.post('/auto-secure-all', enableAutoParkAndGeofence);
router.delete('/delete', deleteAllFences);

router.post('/update-vehicle-settings', updateVehicleSettings);
router.get('/vehicle-settings/:imei', getVehicleSettings);

module.exports = router;