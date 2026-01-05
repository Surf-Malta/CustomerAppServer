const config = require("../config/config");

const getMapsApiKey = (req, res) => {
  try {
    const apiKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      "AIzaSyARG70FxQ0jRcAQMymHstMiFccbW0BN8Lo";
    res.status(200).json({
      status: "success",
      data: {
        apiKey: apiKey,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  getMapsApiKey,
};
