const { default: axios } = require("axios");
const Vehicle = require("../models/Vehicle");
const { getToken } = require("../services/gpsTokenManager");
const { registerVehicle } = require("../services/iopgpsService");
const karzame = require("../services/karzame");

exports.createVehicle = async (req, res) => {
  //	console.log('Start')
  try {
    const vehicleData = req.body;

    //console.log('Vehicle Data:', vehicleData)

    const existingVehicle = await Vehicle.findOne({
      imei: vehicleData.imei,
    });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: "This GPS device is already registered",
      });
    }

    const gpsResponse = await registerVehicle(vehicleData);

    //	console.log('GPS RESPONSE:', gpsResponse)

    if (!gpsResponse || gpsResponse.code !== 0) {
      return res.status(400).json({
        success: false,
        message: "GPS registration failed",
        gpsResponse: gpsResponse,
      });
    }

    vehicleData.gpsConnected = true;
    vehicleData.deviceName = vehicleData.vehicleNickname;

    const vehicle = new Vehicle(vehicleData);
    const savedVehicle = await vehicle.save();

    return res.status(201).json({
      success: true,
      message: "Vehicle registered successfully",
      data: savedVehicle,
      gpsResponse: gpsResponse,
    });
  } catch (error) {
    console.log("CREATE VEHICLE ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getVehicles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { status, movementStatus, stolen, search } = req.query;

    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (movementStatus) {
      filter.movementStatus = movementStatus;
    }

    if (stolen !== undefined && stolen !== "") {
      filter.stolen = stolen === "true";
    }

    if (search) {
      filter.$or = [
        { phone: { $regex: search, $options: "i" } },
        { licensePlate: { $regex: search, $options: "i" } },
        { ownerName: { $regex: search, $options: "i" } },
      ];
    }

    const vehicles = await Vehicle.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Vehicle.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Vehicles fetched successfully",
      data: vehicles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle fetched successfully",
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

exports.getVehiclesByUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { status, movementStatus, stolen } = req.query;

    let filter = {
      userId: req.params.userId,
    };

    if (status) {
      filter.status = status;
    }

    if (movementStatus) {
      filter.movementStatus = movementStatus;
    }

    if (stolen !== undefined && stolen !== "") {
      filter.stolen = stolen === "true";
    }

    const vehicles = await Vehicle.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Vehicle.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "User vehicles fetched successfully",
      data: vehicles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

exports.getVehicleLocation = async (req, res) => {
  try {
    const { imei } = req.params;

    if (!imei) {
      return res.status(400).json({
        success: false,
        message: "IMEI is required",
      });
    }

    const token = getToken();

    const response = await axios.get(
      `https://open.iopgps.com/api/device/location?imei=${imei}`,
      {
        headers: {
          accessToken: token,
          "Content-Type": "application/json",
        },
      },
    );

    const data = response?.data;

    if (!data || data.code !== 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch location",
        data: data,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Location fetched successfully",
      data: {
        latitude: data.lat,
        longitude: data.lng,
        gpsTime: data.gpsTime,
        address: data.address,
      },
    });
  } catch (error) {
    console.log("GET LOCATION ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.testApi = async (req, res) => {
  try {
    console.log("TEST API BODY:", JSON.parse(req.body.body));
    const payload = JSON.parse(req.body.body);
    for (let index = 0; index < payload.length; index++) {
      const element = payload[index];
      const vehicle = await Vehicle.findOne({ imei: element.imei }).lean();
      console.log(vehicle);
      if (vehicle) {
        if (payload.alarmCode == "REMOVE") {
          // vehicle.stolen = true;
          // await vehicle.save();
          const vehicle = await Vehicle.findByIdAndUpdate(
            vehicle._id,
            { stolen: true },
            {
              new: true,
              runValidators: true,
            },
          );
        }
        console.log({ ...vehicle, ...element });
        await karzame({ ...vehicle, ...element });
      }
    }

    // await karzame(vehicle);
    // console.log(vehicle.userId);
    return res.status(200).json({
      success: true,
      message: "Success",
      data: req.body,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
