const axios = require("axios");
const config = require("../config/config");

exports.getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { csCartApi } = config;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required",
      });
    }

    const authHeader = `Basic ${Buffer.from(
      `${csCartApi.username}:${csCartApi.apiKey}`
    ).toString("base64")}`;

    const configGet = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${csCartApi.baseUrl}/NtUserProfileApi/${id}`,
      headers: {
        Authorization: authHeader,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "*/*",
      },
    };

    const response = await axios.request(configGet);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in getUserProfile:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    }
  }
};

exports.getUserAddresses = async (req, res) => {
  try {
    const { user_id } = req.query;
    const { csCartApi } = config;

    if (!user_id) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required",
      });
    }

    const authHeader = `Basic ${Buffer.from(
      `${csCartApi.username}:${csCartApi.apiKey}`
    ).toString("base64")}`;

    const configGet = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${csCartApi.baseUrl}/NtUserProfileApi?user_id=${user_id}`,
      headers: {
        Authorization: authHeader,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "*/*",
      },
    };

    const response = await axios.request(configGet);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in getUserAddresses:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    }
  }
};

exports.getCart = async (req, res) => {
  try {
    const { user_id } = req.query;
    const { csCartApi } = config;

    if (!user_id) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required",
      });
    }

    const authHeader = `Basic ${Buffer.from(
      `${csCartApi.username}:${csCartApi.apiKey}`
    ).toString("base64")}`;

    const configGet = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${csCartApi.baseUrl}/NtCartApi?user_id=${user_id}`,
      headers: {
        Authorization: authHeader,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "*/*",
      },
    };

    const response = await axios.request(configGet);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in getCart:", error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    }
  }
};
