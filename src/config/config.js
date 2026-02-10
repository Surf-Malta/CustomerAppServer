require("dotenv").config();

module.exports = {
  port: process.env.SERVER_PORT || 3000,
  env: process.env.NODE_ENV || "development",
  csCartApi: {
    baseUrl: process.env.CS_CART_API_URL,
    username: process.env.CS_CART_USERNAME,
    apiKey: process.env.CS_CART_API_KEY,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    baseUrl: process.env.GEMINI_API_URL,
  },
  cdnUrl: process.env.BUNNY_CDN_URL,
};
