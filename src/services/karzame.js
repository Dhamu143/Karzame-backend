// require("dotenv").config();
// const axios = require("axios");
// const karzame = async (payload) => {
//   try {
//     console.log("payload");
//     console.log(payload);
//     const response = await axios.post(process.env.KARZAME_URL, payload);
//   } catch (error) {
//     console.log(error);
//   }
// };
// module.exports = karzame;

require("dotenv").config();
const axios = require("axios");

// karzame.js
const karzame = async (payload) => {
  try {
    console.log("📤 Sending to Karzame:", payload);
    
    const response = await axios.post(
      process.env.KARZAME_URL,
      {
        body: JSON.stringify([payload])
      }
    );

    console.log("📥 Karzame Response:", response.data);
  } catch (error) {
    console.log("❌ Karzame Error:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = karzame;