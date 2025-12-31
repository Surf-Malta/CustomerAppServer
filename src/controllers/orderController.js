const axios = require("axios");
const config = require("../config/config");

exports.getOrders = async (req, res) => {
  try {
    const { user_id = 128 } = req.query; // Default to 128 as requested
    const { csCartApi } = config;

    // Construct the external API URL
    const apiUrl = `${csCartApi.baseUrl}/NtOrdersApi?user_id=${user_id}`;

    // Basic Auth Header
    const authHeader = `Basic ${Buffer.from(
      `${csCartApi.username}:${csCartApi.apiKey}`
    ).toString("base64")}`;

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    // Forward the data to the client
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    if (error.response) {
      console.error("External API Status:", error.response.status);
      console.error("External API Data:", error.response.data);
      res.status(500).json({
        status: "error",
        message: "Failed to fetch orders",
        error: error.message,
      });
    }
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { user_id = 128 } = req.query;
    const { csCartApi } = config;

    const apiUrl = `${csCartApi.baseUrl}/NtOrdersApi/${orderId}?user_id=${user_id}`;

    const authHeader = `Basic ${Buffer.from(
      `${csCartApi.username}:${csCartApi.apiKey}`
    ).toString("base64")}`;

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching order details:", error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({
      status: "error",
      message: "Failed to fetch order details",
      error: error.message,
    });
  }
};
