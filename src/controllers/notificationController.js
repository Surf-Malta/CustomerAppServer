const axios = require("axios");
const config = require("../config/config");

exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { csCartApi } = config;

    const apiUrl = `${csCartApi.baseUrl}/NtVnNotification/${userId}`;

    const authHeader = `Basic ${Buffer.from(
      `${csCartApi.username}:${csCartApi.apiKey}`,
    ).toString("base64")}`;

    const response = await axios.get(apiUrl, {
      headers: { Authorization: authHeader },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { message: "Internal server error" });
  }
};

exports.handleNotificationAction = async (req, res) => {
  try {
    const { csCartApi } = config;
    const apiUrl = `${csCartApi.baseUrl}/NtVnNotification`;

    const authHeader = `Basic ${Buffer.from(
      `${csCartApi.username}:${csCartApi.apiKey}`,
    ).toString("base64")}`;

    const response = await axios.post(apiUrl, req.body, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error handling notification action:", error.message);
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { message: "Internal server error" });
  }
};
