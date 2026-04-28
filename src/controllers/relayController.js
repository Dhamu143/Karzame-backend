const axios = require('axios');
const { getToken } = require('../services/gpsTokenManager');
const Vehicle = require('../models/Vehicle');

exports.sendRelayCommand = async (req, res) => {
  try {
    console.log('🚀 START sendRelayCommand');
    console.log('📥 Incoming Request Body:', req.body);

    const token = await getToken();
    const {
      parameter,
      imeis,
      phone,
      code = 0,
      message = "System relay command"
    } = req.body;

    if (!parameter || !imeis || !Array.isArray(imeis) || imeis.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload'
      });
    }

    if (!['1', '2', '3'].includes(String(parameter))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid parameter (allowed: 1,2,3)'
      });
    }

    const vehicle = await Vehicle.findOne({ imei: imeis[0] });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    const normalize = (num) => String(num).replace(/\D/g, '');
    const last4 = (num) => normalize(num).slice(-4);

    if (!phone || phone.replace(/\D/g, '').length !== 4) {
      return res.status(400).json({
        success: false,
        message: "Please enter last 4 digits of your mobile number",
      });
    }

    if (last4(vehicle.phone) !== last4(phone)) {
      return res.status(403).json({
        success: false,
        message: "Invalid mobile number",
      });
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'GPS API token missing'
      });
    }

    console.log('🔑 Token OK');

    const iopgpsPayload = {
      code: Number(code),
      message: String(message),
      parameter: String(parameter),
      imeis
    };

    console.log('📤 Sending to IOPGPS:', iopgpsPayload);

    const response = await axios.post(
      'https://open.iopgps.com/api/instruction/relay',
      iopgpsPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          accessToken: token
        }
      }
    );

    console.log('✅ IOPGPS Response:', response.data);

    const isSuccess = response.data.code === 0;

    if (isSuccess) {
      await Vehicle.updateMany(
        { imei: { $in: imeis } },
        {
          $push: {
            relayLogs: {
              parameter: String(parameter),
              message
            }
          }
        }
      );

      let engineStatus = null;

      if (String(parameter) === "1") engineStatus = true;
      if (String(parameter) === "2") engineStatus = false;

      if (engineStatus !== null) {
        await Vehicle.updateMany(
          { imei: { $in: imeis } },
          { engineStatus }
        );

        console.log(
          `🔧 Engine Status Updated → ${engineStatus ? "ON" : "OFF"}`
        );
      }
    }

    console.log(isSuccess ? '🎉 Command Success' : '⚠️ Command Failed');
    console.log('==============================\n');

    return res.status(200).json({
      success: isSuccess,
      message: isSuccess
        ? 'Command sent successfully'
        : response.data.result || 'Command failed',
      data: response.data
    });

  } catch (error) {
    console.error('\n🔥 ERROR in sendRelayCommand');

    let statusCode = 500;
    let errorDetails = error.message;

    if (error.response) {
      statusCode = error.response.status;
      console.error('🚨 GPS API Error:', error.response.data);
      errorDetails =
        error.response.data?.result || error.response.data;
    }

    console.error('❌ Final Error:', errorDetails);
    console.log('==============================\n');

    return res.status(statusCode).json({
      success: false,
      message: 'Failed to communicate with GPS provider',
      error: errorDetails
    });
  }
};


exports.sendRelay = async (parameter, imeis, code = 0, message = "System relay command") => {
  try {
    console.log('🚀 START sendRelay');
    console.log('📥 Parameters:', { parameter, imeis, code, message });

    if (!parameter || !imeis || !Array.isArray(imeis) || imeis.length === 0) {
      console.log('❌ Invalid payload');
      throw new Error('Invalid payload. "parameter" and imeis[] required');
    }
    
    if (!['1', '2', '3'].includes(String(parameter))) {
      console.log('❌ Invalid parameter:', parameter);
      throw new Error('Invalid parameter (allowed: 1,2,3)');
    }

    const token = await getToken();
    if (!token) {
      console.log('❌ Token missing');
      throw new Error('GPS API token missing');
    }

    console.log('🔑 Token OK');

    await Vehicle.updateMany(
      { imei: { $in: imeis } },
      {
        $push: {
          relayLogs: {
            parameter: String(parameter),
            message
          }
        }
      }
    );

    console.log('💾 Relay logs saved for IMEIs:', imeis);

    let engineStatus = null;

    if (String(parameter) === "1") {
      engineStatus = true;
    } else if (String(parameter) === "2") {
      engineStatus = false;
    }

    if (engineStatus !== null) {
      await Vehicle.updateMany(
        { imei: { $in: imeis } },
        { engineStatus }
      );

      console.log(
        `🔧 Engine Status Updated → ${engineStatus ? "ON" : "OFF"}`
      );
    } else {
      console.log('ℹ️ No engine status change for parameter:', parameter);
    }

    const iopgpsPayload = {
      code: Number(code),
      message: String(message),
      parameter: String(parameter),
      imeis
    };

    console.log('📤 Sending to IOPGPS:', iopgpsPayload);

    const response = await axios.post(
      'https://open.iopgps.com/api/instruction/relay',
      iopgpsPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          accessToken: token
        }
      }
    );

    console.log('✅ IOPGPS Response:', response.data);

    const isSuccess = response.data.code === 0;

    console.log(isSuccess ? '🎉 Command Success' : '⚠️ Command Failed');

    return {
      success: isSuccess,
      message: isSuccess
        ? 'Command sent successfully'
        : response.data.result || 'Command failed',
      data: response.data
    };

  } catch (error) {
    console.error('\n🔥 ERROR in sendRelay');

    let errorDetails = error.message;

    if (error.response) {
      console.error('🚨 GPS API Error:', error.response.data);
      errorDetails =
        error.response.data?.result || error.response.data;
    }

    console.error('❌ Final Error:', errorDetails);

    throw new Error(errorDetails);
  }
};
