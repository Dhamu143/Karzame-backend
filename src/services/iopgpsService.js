const axios = require('axios')
const { getToken } = require('./gpsTokenManager')

exports.registerVehicle = async (vehicleData) => {
	try {
		const token = getToken()

		const payload = {
			licenseNumber: vehicleData.licensePlate,
			carOwner: vehicleData.ownerName,
			contactUser: vehicleData.ownerName,
			contactTel: vehicleData.phone,
			contractNumber: vehicleData.engineNumber,
			vin: vehicleData.chassisNumber,
			data: [
				{
					imei: vehicleData.imei,
					name: vehicleData.vehicleNickname,
					note: 'Added from mobile app',
					cardNo: '',
				},
			],
		}

		console.log('Sending to IOPGPS:', payload)

		const response = await axios.post('https://open.iopgps.com/api/vehicle', payload, {
			headers: {
				accessToken: token,
				'Content-Type': 'application/json',
			},
		})

		console.log('IOPGPS RESPONSE:', response.data)

		return response.data
	} catch (error) {
		console.log('IOPGPS ERROR:', error.response?.data || error.message)

		return (
			error.response?.data || {
				code: -1,
				msg: 'IOPGPS server error',
			}
		)
	}
}
