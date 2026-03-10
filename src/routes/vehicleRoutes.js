const express = require('express')
const router = express.Router()

const {
	createVehicle,
	getVehicles,
	getVehicleById,
	updateVehicle,
	deleteVehicle,
	getVehiclesByUser,
} = require('../controllers/vehicleController')

router.post('/', createVehicle)

router.get('/', getVehicles)

router.get('/user/:userId', getVehiclesByUser)

router.get('/:id', getVehicleById)

router.put('/:id', updateVehicle)

router.delete('/:id', deleteVehicle)

module.exports = router
