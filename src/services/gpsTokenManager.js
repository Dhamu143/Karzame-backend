const axios = require("axios");
const md5 = require("md5");

const API_KEY = process.env.GPS_API_KEY;
const APP_ID = process.env.GPS_APP_ID;

let accessToken = null;
let generating = false;

async function generateToken() {
  if (generating) return;

  generating = true;

  try {
    const time = Math.floor(Date.now() / 1000);

    const md5Key = md5(API_KEY);

    const signature = md5(md5Key + time);

    console.log("signature", signature, time);

    const response = await axios.post("https://open.iopgps.com/api/auth", {
      signature,
      appid: APP_ID,
      time,
    });

    if (response.data && response.data.accessToken) {
      accessToken = response.data.accessToken;

      console.log("New GPS Token Generated", accessToken);
      return accessToken;
    } else {
      console.log(" Invalid token response from IOPGPS");
    }
  } catch (error) {
    console.log(" GPS Token Error:", error.message);
  }

  generating = false;
}

async function getToken() {
  if (!accessToken) {
    return await generateToken();
    console.log("No token available, generating new token...");
  }

  return accessToken;
}

module.exports = {
  generateToken,
  getToken,
};
