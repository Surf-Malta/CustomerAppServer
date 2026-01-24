const axios = require("axios");
const config = require("../config/config");

exports.getOrders = async (req, res) => {
  try {
    const { user_id } = req.query;
    const { csCartApi } = config;

    // Construct the external API URL
    const apiUrl = `${csCartApi.baseUrl}/NtOrdersApi/?user_id=${user_id}`;

    // Basic Auth Header
    const authHeader = `Basic ${Buffer.from(
      `${csCartApi.username}:${csCartApi.apiKey}`
    ).toString("base64")}`;

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Sec-Ch-Ua":
          '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "X-Requested-With": "XMLHttpRequest",
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
    const { user_id } = req.query;
    const { csCartApi } = config;

    const apiUrl = `${csCartApi.baseUrl}/NtOrdersApi/${orderId}/?user_id=${user_id}`;

    const authHeader = `Basic ${Buffer.from(
      `${csCartApi.username}:${csCartApi.apiKey}`
    ).toString("base64")}`;

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Sec-Ch-Ua":
          '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "X-Requested-With": "XMLHttpRequest",
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
