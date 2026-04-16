const axios = require('axios');
const { getToken } = require('../services/gpsTokenManager');
const Vehicle = require('../models/Vehicle');

exports.sendRelayCommand = async (req, res) => {
  try {
    console.log('\n==============================');
    console.log('🚀 START sendRelayCommand');
    console.log('📥 Incoming Request Body:', req.body);

    const {
      parameter,
      imeis,
      code = 0,
      message = "System relay command"
    } = req.body;

    if (!parameter || !imeis || !Array.isArray(imeis) || imeis.length === 0) {
      console.log('❌ Invalid payload');
      return res.status(400).json({
        success: false,
        message: 'Invalid payload. "parameter" and imeis[] required'
      });
    }

    if (!['1', '2', '3'].includes(String(parameter))) {
      console.log('❌ Invalid parameter:', parameter);
      return res.status(400).json({
        success: false,
        message: 'Invalid parameter (allowed: 1,2,3)'
      });
    }

    const token = getToken();
    if (!token) {
      console.log('❌ Token missing');
      return res.status(401).json({
        success: false,
        message: 'GPS API token missing'
      });
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
      engineStatus = false; // OFF
    } else if (String(parameter) === "2") {
      engineStatus = true; // ON
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

    console.log(
      isSuccess
        ? '🎉 Command Success'
        : '⚠️ Command Failed'
    );

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