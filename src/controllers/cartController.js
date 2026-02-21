const axios = require("axios");
const config = require("../config/config");

const fs = require("fs");
const path = require("path");

exports.addToCart = async (req, res) => {
  try {
    const { csCartApi } = config;
    const { user_id, product_data, product_id, amount } = req.body;

    const apiUrl = `${csCartApi.baseUrl}/NtCartApi`;
    const authHeader = `Basic ${Buffer.from(
      `${csCartApi.username}:${csCartApi.apiKey}`,
    ).toString("base64")}`;

    // Ensure numeric types where expected
    const numericUserId = user_id ? parseInt(String(user_id), 10) : null;
    const normalizedProductData = Array.isArray(product_data)
      ? product_data.map((p) => ({
          ...p,
          amount: parseInt(String(p.amount), 10) || 1,
          product_id: String(p.product_id),
        }))
      : product_id
        ? [
            {
              product_id: String(product_id),
              amount: parseInt(String(amount), 10) || 1,
            },
          ]
        : product_data;

    const payload =
      numericUserId !== null
        ? { user_id: numericUserId, product_data: normalizedProductData }
        : { product_data: normalizedProductData };

    console.log(`[CartController] POST addToCart for user ${numericUserId}`);
    console.log(`[CartController] URL: ${apiUrl}`);
    console.log(`[CartController] Payload: ${JSON.stringify(payload)}`);

    const response = await axios.post(apiUrl, payload, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "*/*",
      },
    });

    console.log(`[CartController] Add response status: ${response.status}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error adding to cart:", error.message);
    if (error.response) {
      console.error(
        "[CartController] External Error Data:",
        JSON.stringify(error.response.data),
      );
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
    const { user_id } = req.params;
    const { item_id } = req.body;

    if (!user_id || !item_id) {
      return res.status(400).json({
        status: "error",
        message: "user_id (in path) and item_id (in body) are required",
      });
    }

    const apiUrl = `${csCartApi.baseUrl}/NtCartApi/${user_id}`;

    const authHeader = `Basic ${Buffer.from(
      `${csCartApi.username}:${csCartApi.apiKey}`,
    ).toString("base64")}`;

    const payload = {
      delete_item_in_cart: 1,
      item_id: parseInt(String(item_id), 10),
      user_id: parseInt(String(user_id), 10),
    };

    console.log(
      `[CartController] PUT removeFromCart for user ${user_id}, item_id ${item_id}`,
    );
    console.log(`[CartController] URL: ${apiUrl}`);
    console.log(`[CartController] Payload: ${JSON.stringify(payload)}`);

    const response = await axios.put(apiUrl, payload, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "*/*",
      },
    });

    console.log(`[CartController] Remove response status: ${response.status}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error removing from cart:", error.message);
    if (error.response) {
      console.error(
        "[CartController] External Error Data:",
        JSON.stringify(error.response.data),
      );
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({
      status: "error",
      message: "Failed to remove from cart",
      error: error.message,
    });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const { csCartApi } = config;
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        status: "error",
        message: "user_id is required in path",
      });
    }

    const apiUrl = `${csCartApi.baseUrl}/NtCartApi/${user_id}`;

    const authHeader = `Basic ${Buffer.from(
      `${csCartApi.username}:${csCartApi.apiKey}`,
    ).toString("base64")}`;

    const payload = {
      user_id: parseInt(String(user_id), 10),
    };

    console.log(`[CartController] DELETE clearCart for user ${user_id}`);
    console.log(`[CartController] URL: ${apiUrl}`);
    console.log(`[CartController] Payload: ${JSON.stringify(payload)}`);

    const response = await axios.delete(apiUrl, {
      data: payload,
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "*/*",
      },
    });

    console.log(`[CartController] Clear response status: ${response.status}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error clearing cart:", error.message);
    if (error.response) {
      console.error(
        "[CartController] External Error Data:",
        JSON.stringify(error.response.data),
      );
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({
      status: "error",
      message: "Failed to clear cart",
      error: error.message,
    });
  }
};
