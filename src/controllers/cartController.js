const axios = require("axios");
const config = require("../config/config");

exports.addToCart = async (req, res) => {
  try {
    const { csCartApi } = config;
    const productData = req.body;

    // New API endpoint: https://dev.surf.mt/api/2.0/NtCartApi
    const apiUrl = `${csCartApi.baseUrl}/NtCartApi`;

    const authHeader = `Basic ${Buffer.from(
      `${csCartApi.username}:${csCartApi.apiKey}`,
    ).toString("base64")}`;

    const { user_id, product_data } = req.body;
    const payload = user_id ? { user_id, product_data } : { product_data };

    const response = await axios.post(apiUrl, payload, {
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
    console.error("Error adding to cart:", error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({
      status: "error",
      message: "Failed to add to cart",
      error: error.message,
    });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { csCartApi } = config;
    const { user_id, delete_id } = req.query;

    if (!user_id || !delete_id) {
      return res.status(400).json({
        status: "error",
        message: "user_id and delete_id are required",
      });
    }

    const apiUrl = `${csCartApi.baseUrl}/NtCartApi?user_id=${user_id}&delete_id=${delete_id}`;

    const authHeader = `Basic ${Buffer.from(
      `${csCartApi.username}:${csCartApi.apiKey}`,
    ).toString("base64")}`;

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: authHeader,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "*/*",
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error removing from cart:", error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({
      status: "error",
      message: "Failed to remove from cart",
      error: error.message,
    });
  }
};
