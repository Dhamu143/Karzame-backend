require("dotenv").config();
const axios = require("axios");
const karzame = async (payload) => {
  try {
    console.log("payload");
    console.log(payload);
    const response = await axios.post(process.env.KARZAME_URL, payload);
       console.log("✅ Karzame response:", response.data);
  } catch (error) {
    console.log(error);
  }
};
module.exports = karzame;
