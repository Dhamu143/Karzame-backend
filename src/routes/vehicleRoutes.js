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
// console.log('truww')
router.get('/', getVehicles)

router.get('/user/:userId', getVehiclesByUser)

router.get('/:id', getVehicleById)

router.put('/:id', updateVehicle)

router.delete('/:id', deleteVehicle)

router.get('/location/:imei', getVehicleLocation)
router.post('/test', testApi)

module.exports = router
