const axios = require("axios");
const config = require("../config/config");

exports.getWishlist = async (req, res) => {
  try {
    const { csCartApi } = config;
    const { user_id } = req.query;

    const apiUrl = `${csCartApi.baseUrl}/NtWishlistApi?user_id=${
      user_id || 128
    }`;

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

    console.log("Wishlist fetched successfully from: ", apiUrl);
    if (response.data && response.data.products) {
      console.log(
        `Wishlist contains ${response.data.products.length} products`
      );
      if (response.data.products.length > 0) {
        console.log(
          "First product fields:",
          Object.keys(response.data.products[0]).join(", ")
        );
        console.log(
          "First product cart_id:",
          response.data.products[0].cart_id
        );
      }
    }
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching wishlist:", error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({
      status: "error",
      message: "Failed to fetch wishlist",
      error: error.message,
    });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { csCartApi } = config;
    const { user_id } = req.query;
    const postData = req.body;

    const apiUrl = `${csCartApi.baseUrl}/NtWishlistApi?user_id=${
      user_id || 152
    }`;

    const authHeader = `Basic ${Buffer.from(
      `${csCartApi.username}:${csCartApi.apiKey}`
    ).toString("base64")}`;

    const response = await axios.post(apiUrl, postData, {
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
    console.error("Error adding to wishlist:", error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({
      status: "error",
      message: "Failed to add to wishlist",
      error: error.message,
    });
  }
};
exports.removeFromWishlist = async (req, res) => {
  try {
    const { csCartApi } = config;
    const { user_id } = req.query;
    const { cart_id } = req.body;

    if (!cart_id) {
      return res.status(400).json({
        status: "error",
        message: "cart_id is required",
      });
    }

    const apiUrl = `${csCartApi.baseUrl}/NtWishlistApi?user_id=${
      user_id || 152
    }`;

    const authHeader =
      "Basic YWRtaW5Ac3VyZi5tdDpOOW9aMnlXMzc3cEg1VTExNTFiY3YyZlYyNDYySTk1NA==";

    const postData = {
      user_id: String(user_id || 152),
      remove_from_wishlist: "Y",
      cart_id: cart_id,
    };

    const response = await axios.post(apiUrl, postData, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "*/*",
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error removing from wishlist:", error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({
      status: "error",
      message: "Failed to remove from wishlist",
      error: error.message,
    });
  }
};
