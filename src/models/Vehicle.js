const mongoose = require('mongoose')

const vehicleSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			ref: 'User',
			required: true,
			index: true,
		},

		vehicleNickname: {
			type: String,
			required: true,
			trim: true,
		},

		ownerName: {
			type: String,
			required: true,
			trim: true,
		},

		phone: {
			type: String,
			required: true,
			trim: true,
		},

		email: {
			type: String,
			required: true,
			trim: true,
		},

		licensePlate: {
			type: String,
			required: true,
			trim: true,
		},

		chassisNumber: {
			type: String,
			required: true,
			trim: true,
		},

		engineNumber: {
			type: String,
			required: true,
			trim: true,
		},

		// imei: {
		// 	type: String,
		// 	required: true,
		// 	unique: true,
		// 	trim: true,
		// },

		confirm: {
			type: Boolean,
			default: false,
		},

		images: [
			{
				type: String,
			},
		],

		status: {
			type: String,
			enum: ['online', 'offline'],
			default: 'online',
		},

		movementStatus: {
			type: String,
			enum: ['moving', 'parked'],
			default: 'parked',
		},

		stolen: {
			type: Boolean,
			default: false,
		},

		batteryLevel: {
			type: Number,
			default: 100,
		},

		imei: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},

		gpsConnected: {
			type: Boolean,
			default: false,
		},

		deviceName: {
			type: String,
		},

		location: {
			address: {
				type: String,
				default: 'Unknown Location',
			},
			latitude: Number,
			longitude: Number,
		},

		alerts: {
			type: Number,
			default: 0,
		},

		lastUpdated: {
			type: Date,
			default: Date.now,
		},
		prkkey: {
			type: Boolean,
			default: false,
		},
		prktime: {
			type: Date,
			default: null,
		},
		speed: {
			type: Number,
			default: 0,
		},
		autoPark: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true },
)

module.exports = mongoose.model('Vehicle', vehicleSchema)
