const axios = require("axios");
const config = require("../config/config");

/**
 * Proxies a review submission to the CS-Cart API.
 */
exports.createReview = async (req, res) => {
  try {
    const { csCartApi } = config;
    const payload = req.body;

    const apiUrl = `${csCartApi.baseUrl}/NtReviewsApi?lang_code=en`;

    // Using the hardcoded auth header consistent with other controllers in this project
    const authHeader =
      "Basic YWRtaW5Ac3VyZi5tdDpOOW9aMnlXMzc3cEg1VTExNTFiY3YyZlYyNDYySTk1NA==";

    const response = await axios.post(apiUrl, payload, {
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
    console.error("Error creating review:", error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({
      status: "error",
      message: "Failed to submit review",
      error: error.message,
    });
  }
};
