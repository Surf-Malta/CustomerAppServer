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
      url: `${csCartApi.baseUrl}/NtUserProfileApi/${id}/`,
      headers: {
        Authorization: authHeader,
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
      url: `${csCartApi.baseUrl}/NtUserProfileApi/?user_id=${user_id}`,
      headers: {
        Authorization: authHeader,
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
      url: `${csCartApi.baseUrl}/NtCartApi/?user_id=${user_id}`,
      headers: {
        Authorization: authHeader,
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
    };

    console.log("Fetching cart from URL:", configGet.url);
    console.log("With headers:", JSON.stringify(configGet.headers, null, 2));

    const response = await axios.request(configGet);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in getCart:", error.message);
    if (error.response) {
      console.error(
        "External API Error Response:",
        JSON.stringify(error.response.data, null, 2)
      );
      console.error("External API Status:", error.response.status);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error("Full Error Object:", error);
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        details: error.message,
      });
    }
  }
};
exports.createUser = async (req, res) => {
  try {
    const { csCartApi } = config;
    const profileData = req.body;

    const authHeader = `Basic ${Buffer.from(
      `${csCartApi.username}:${csCartApi.apiKey}`
    ).toString("base64")}`;

    const configPost = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${csCartApi.baseUrl}/NtUserProfileApi/`,
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      data: profileData,
    };

    const response = await axios.request(configPost);
    console.log(
      "External API Response for Create User:",
      JSON.stringify(response.data, null, 2)
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in createUser:", error.message);
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

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { csCartApi } = config;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required",
      });
    }

    const authHeader = `Basic ${Buffer.from(
      `${csCartApi.username}:${csCartApi.apiKey}`
    ).toString("base64")}`;

    const configPut = {
      method: "put",
      maxBodyLength: Infinity,
      url: `${csCartApi.baseUrl}/NtUserProfileApi/${id}`,
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      data: updateData,
    };

    const response = await axios.request(configPut);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in updateUser:", error.message);
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
