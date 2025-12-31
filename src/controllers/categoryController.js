const axios = require("axios");
const config = require("../config/config");

exports.getCategories = async (req, res) => {
  try {
    const { csCartApi } = config;
    const apiUrl = `${csCartApi.baseUrl}/NtCategoriesApi`;

    const authHeader = `Basic ${Buffer.from(
      `${csCartApi.username}:${csCartApi.apiKey}`
    ).toString("base64")}`;

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        Connection: "keep-alive",
        "X-Requested-With": "XMLHttpRequest",
        Referer: apiUrl.split("/api")[0] || apiUrl,
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({
      status: "error",
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};
