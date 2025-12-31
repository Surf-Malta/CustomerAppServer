const axios = require("axios");

exports.getOrders = async (req, res) => {
  try {
    const { user_id = 128 } = req.query; // Default to 128 as requested

    // Construct the external API URL
    const apiUrl = `https://dev.surf.mt/api/2.0/NtOrdersApi?user_id=${user_id}`;

    // Basic Auth Header
    const authHeader =
      "Basic YWRtaW5Ac3VyZi5tdDpOOW9aMnlXMzc3cEg1VTExNTFiY3YyZlYyNDYySTk1NA==";

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

    const apiUrl = `https://dev.surf.mt/api/2.0/NtOrdersApi/${orderId}?user_id=${user_id}`;

    const authHeader =
      "Basic YWRtaW5Ac3VyZi5tdDpOOW9aMnlXMzc3cEg1VTExNTFiY3YyZlYyNDYySTk1NA==";

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
