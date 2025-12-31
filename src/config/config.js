require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || "development",
  csCartApi: {
    baseUrl: process.env.CS_CART_API_URL,
    username: process.env.CS_CART_USERNAME,
    apiKey: process.env.CS_CART_API_KEY,
  },
};
