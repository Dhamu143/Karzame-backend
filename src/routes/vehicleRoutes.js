const express = require('express')
const router = express.Router()

const {
	createVehicle,
	getVehicles,
	getVehicleById,
	updateVehicle,
	deleteVehicle,
	getVehiclesByUser,
	getVehicleLocation,
	testApi,
} = require('../controllers/vehicleController')

router.post('/', createVehicle)

router.get('/', getVehicles)

router.get('/user/:userId', getVehiclesByUser)
	
router.get('/location/:imei', getVehicleLocation)

router.get('/:id', getVehicleById)

router.put('/:id', updateVehicle)

router.delete('/:id', deleteVehicle)

router.post('/test', testApi)

module.exports = router
