const Vehicle = require('../models/Vehicle')

exports.createVehicle = async (req, res) => {
	try {
		const vehicle = new Vehicle(req.body)
		const savedVehicle = await vehicle.save()

		res.status(201).json({
			success: true,
			message: 'Vehicle created successfully',
			data: savedVehicle,
		})
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
			data: null,
		})
	}
}
exports.getVehicles = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1
		const limit = parseInt(req.query.limit) || 10
		const skip = (page - 1) * limit

		const { status, movementStatus, stolen } = req.query

		let filter = {}

		if (status) {
			filter.status = status
		}

		if (movementStatus) {
			filter.movementStatus = movementStatus
		}

		if (stolen !== undefined && stolen !== '') {
			filter.stolen = stolen === 'true'
		}

		const vehicles = await Vehicle.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 })

		const total = await Vehicle.countDocuments(filter)

		res.status(200).json({
			success: true,
			message: 'Vehicles fetched successfully',
			data: vehicles,
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		})
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
			data: null,
		})
	}
}
// GET VEHICLE BY ID
exports.getVehicleById = async (req, res) => {
	try {
		const vehicle = await Vehicle.findById(req.params.id)

		if (!vehicle) {
			return res.status(404).json({
				success: false,
				message: 'Vehicle not found',
				data: null,
			})
		}

		res.status(200).json({
			success: true,
			message: 'Vehicle fetched successfully',
			data: vehicle,
		})
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
			data: null,
		})
	}
}

exports.getVehiclesByUser = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1
		const limit = parseInt(req.query.limit) || 10
		const skip = (page - 1) * limit

		const { status, movementStatus, stolen } = req.query

		let filter = {
			userId: req.params.userId,
		}

		if (status) {
			filter.status = status
		}

		if (movementStatus) {
			filter.movementStatus = movementStatus
		}

		if (stolen !== undefined && stolen !== '') {
			filter.stolen = stolen === 'true'
		}

		const vehicles = await Vehicle.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 })

		const total = await Vehicle.countDocuments(filter)

		res.status(200).json({
			success: true,
			message: 'User vehicles fetched successfully',
			data: vehicles,
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		})
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
			data: null,
		})
	}
}

// UPDATE VEHICLE
exports.updateVehicle = async (req, res) => {
	try {
		const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		})

		if (!vehicle) {
			return res.status(404).json({
				success: false,
				message: 'Vehicle not found',
				data: null,
			})
		}

		res.status(200).json({
			success: true,
			message: 'Vehicle updated successfully',
			data: vehicle,
		})
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
			data: null,
		})
	}
}

exports.deleteVehicle = async (req, res) => {
	try {
		const vehicle = await Vehicle.findByIdAndDelete(req.params.id)

		if (!vehicle) {
			return res.status(404).json({
				success: false,
				message: 'Vehicle not found',
				data: null,
			})
		}

		res.status(200).json({
			success: true,
			message: 'Vehicle deleted successfully',
			data: null,
		})
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
			data: null,
		})
	}
}
