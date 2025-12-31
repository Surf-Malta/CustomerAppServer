const axios = require("axios");
const config = require("../config/config");

exports.getHomeLayout = async (req, res) => {
  try {
    const { image_width, user_id = 2 } = req.query;
    const { csCartApi } = config;

    // Construct the external API URL
    const apiUrl = `${csCartApi.baseUrl}/NtHomepageLayoutApi?image_width=${
      image_width || 20
    }&user_id=${user_id}`;

    const authHeader = `Basic ${Buffer.from(
      `${csCartApi.username}:${csCartApi.apiKey}`
    ).toString("base64")}`;

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: authHeader,
      },
    });

    // Forward the data to the client
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching home layout:", error.message);
    if (error.response) {
      console.error("External API Status:", error.response.status);
      console.error("External API Data:", error.response.data);
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({
      status: "error",
      message: "Failed to fetch home layout",
      error: error.message,
    });
  }
};
