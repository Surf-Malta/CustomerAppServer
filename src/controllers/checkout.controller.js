const axios = require("axios");
const config = require("../config/config");

/**
 * Get checkout data including payment methods, shipping methods, and cart details
 * @route GET /api/checkout
 * @param {string} user_id - User ID
 */
exports.getCheckoutData = async (req, res) => {
  try {
    const { user_id, shipping_ids } = req.query;
    const { csCartApi } = config;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    let apiUrl = `${csCartApi.baseUrl}/NtCheckoutApi/?user_id=${user_id}`;
    if (shipping_ids) {
      apiUrl += `&shipping_ids=${shipping_ids}`;
    }

    console.log(`Fetching checkout data for user ${user_id}...`);

    const response = await axios.get(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
      },
      auth: {
        username: csCartApi.username,
        password: csCartApi.apiKey,
      },
    });

    console.log("Checkout data fetched successfully");
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching checkout data:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      return res.status(error.response.status).json({
        success: false,
        message: "Failed to fetch checkout data from external API",
        error: error.response.data,
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching checkout data",
      error: error.message,
    });
  }
};

/**
 * Place an order
 * @route POST /api/checkout
 */
exports.placeOrder = async (req, res) => {
  try {
    const { csCartApi } = config;
    const payload = req.body;

    const apiUrl = `${csCartApi.baseUrl}/NtCheckoutApi`;

    console.log("Placing order...");

    const response = await axios.post(apiUrl, payload, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      auth: {
        username: csCartApi.username,
        password: csCartApi.apiKey,
      },
    });

    console.log("Order placed successfully");
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error placing order:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({
      success: false,
      message: "Internal server error while placing order",
      error: error.message,
    });
  }
};
