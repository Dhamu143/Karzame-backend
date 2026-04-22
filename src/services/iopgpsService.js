const axios = require("axios");
const { getToken } = require("./gpsTokenManager");

const registerVehicle = async (vehicleData) => {
  try {
    const token = await getToken();
		
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
          note: "Added from mobile app",
          cardNo: "",
        },
      ],
    };

    console.log("Sending to IOPGPS:", payload);

    const response = await axios.post(
      "https://open.iopgps.com/api/vehicle",
      payload,
      {
        headers: {
          accessToken: token,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("IOPGPS RESPONSE:", response.data);

    return response.data;
  } catch (error) {
    console.log("IOPGPS ERROR:", error.response?.data || error.message);

    return (
      error.response?.data || {
        code: -1,
        msg: "IOPGPS server error",
      }
    );
  }
};

const checkDevice = async (imei) => {
  try {
    console.log(`Checking device with IMEI: ${imei}`);
    const token = await getToken();
    console.log("Token for device check:", token);
    if (token) {
      console.log(`Checking device with IMEI:========= ${imei}`);
      const response = await axios.get(
        `https://open.iopgps.com/api/device/detail?imei=${imei}`,
        {
          headers: {
            accessToken: token,
            "Content-Type": "application/json",
          },
        },
      );
      console.log("response.data", response.data);
      if (response.data && response.data.success) {
        console.log(
          "IOPGPS RESPONSE:",
          response.data.data.vehicleBean.licenseNumber,
        );
        return response.data.data;
      } else {
        throw new Error("no device found");
      }
    }
  } catch (error) {
    console.log("IOPGPS ERROR:", error.response?.data || error.message);

    return (
      error.response?.data || {
        code: -1,
        msg: "IOPGPS server error",
      }
    );
  }
};
// setTimeout(() => {
//   checkDevice("867144061168249");
// }, 3000);

module.exports = {
  registerVehicle,
  checkDevice,
};
