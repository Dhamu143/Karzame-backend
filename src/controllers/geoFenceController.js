const axios = require('axios');
const GeoFence = require('../models/GeoFence');
const { getToken } = require("../services/gpsTokenManager");
const Vehicle = require('../models/Vehicle');
const { getVehicleLocation } = require('../controllers/vehicleController');

exports.createGeoFence = async (req, res) => {
  console.log('🔵 createGeoFence API HIT');
  console.log('📥 Incoming Body:', req.body);

  try {
    const token = getToken();
    console.log('🔐 Token:', token);

    const { imei, fenceName, radius, lat, lng } = req.body;

    // ✅ Validate input
    if (!imei || !lat || !lng || !radius) {
      console.log('❌ Missing fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const existingFences = await GeoFence.find({ imei });
    console.log('🔍 Existing Fences Count:', existingFences.length);

    for (const fence of existingFences) {
      if (!fence.fenceId) continue;

      try {
        console.log('🗑️ Deleting fence:', fence.fenceId);

        const deleteRes = await axios.delete(
          `https://open.iopgps.com/api/fence/del/${fence.fenceId}`,
          {
            params: { imei },
            headers: {
              accessToken: token,
            },
          }
        );

        console.log('📥 Delete Response:', deleteRes.data);

      } catch (err) {
        const status = err.response?.status;

        if (status === 404) {
          console.log(`⚠️ Fence ${fence.fenceId} already deleted`);
        } else {
          console.log(
            `❌ Failed deleting ${fence.fenceId}:`,
            err.response?.data || err.message
          );
        }
      }
    }

    if (existingFences.length > 0) {
      await GeoFence.deleteMany({ imei });
      console.log('✅ Cleared all old fences from DB');
    }

    const payload = {
      triggerType: 1,
      mapType: 1,
      oneTime: 1,
      type: 2,
      fenceName,
      imei,
      setting: `${lng} ${lat} ${radius}`,
    };

    console.log('📦 Creating new fence payload:', payload);

    const response = await axios.post(
      'https://open.iopgps.com/api/fence/add',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          accessToken: token,
        },
      }
    );

    console.log('📥 Create Response:', response.data);

    if (response.data?.resultBean?.code !== 0) {
      console.log('❌ Fence creation failed:', response.data);

      return res.status(400).json({
        success: false,
        message: 'Failed to create fence',
        data: response.data,
      });
    }

    const fenceId = response.data?.fenceId;
    console.log('🆔 New Fence ID:', fenceId);

    const savedFence = await GeoFence.create({
      imei,
      fenceName,
      radius,
      lat,
      lng,
      fenceId,
    });

    console.log('💾 Saved Fence:', savedFence);

    return res.json({
      success: true,
      message: 'Geo-fence replaced successfully',
      data: savedFence,
    });

  } catch (error) {
    console.log(
      '🔥 createGeoFence ERROR:',
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
};

exports.getGeoFences = async (req, res) => {
  console.log('🔵 getGeoFences API HIT');

  try {
    const { imei } = req.params;
    console.log('📥 IMEI:', imei);

    if (!imei) {
      console.log('❌ IMEI missing');
      return res.status(400).json({
        success: false,
        message: 'IMEI is required',
      });
    }

    const fences = await GeoFence.find({ imei }).sort({ createdAt: -1 });

    console.log('📤 Fetched Fences:', fences.length);

    res.json({
      success: true,
      data: fences,
    });

  } catch (error) {
    console.log('🔥 Fetch Fence Error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch geo-fences',
    });
  }
};


// Inside controllers/geoFenceController.js

exports.enableAutoParkAndGeofence = async (req, res) => {
  try {
    const { userId, enable } = req.body;
    console.log('🚀 Auto Secure DB Update API HIT');

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId required' });
    }

    // ✅ Just update the autoPark flag in the database
    await Vehicle.updateMany(
      { userId },
      { $set: { autoPark: enable } }
    );

    console.log(`⚙️ autoPark set to ${enable} for all vehicles belonging to ${userId}`);

    // Note: If 'enable' is false, you might want to delete existing geofences right here.

    return res.json({
      success: true,
      message: `AutoPark flag ${enable ? 'enabled' : 'disabled'} in database`,
    });

  } catch (error) {
    console.log('🔥 ERROR:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAllFences = async (req, res) => {
  try {
    await GeoFence.deleteMany({});
    console.log("🗑️ All fences deleted");

    res.json({
      success: true,
      message: "All geofences deleted"
    });
  } catch (err) {
    console.log("❌ Error:", err.message);
    res.status(500).json({ success: false });
  }
};