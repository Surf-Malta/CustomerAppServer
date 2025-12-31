const axios = require("axios");
const config = require("../config/config");

exports.loginWithEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const { csCartApi } = config;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required",
      });
    }

    const authHeader = `Basic ${Buffer.from(
      `${csCartApi.username}:${csCartApi.apiKey}`
    ).toString("base64")}`;

    const configPost = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${csCartApi.baseUrl}/NtOtpLoginApi/`,
      headers: {
        "Content-Type": "application/json",
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
      data: JSON.stringify({
        destination: email,
        verification_method: "email",
      }),
    };

    const response = await axios.request(configPost);

    // Forward the successful response from the external API
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in loginWithEmail:", error.message);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error(error.request);
      res.status(503).json({
        status: "error",
        message: "No response from external API",
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error", error.message);
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    }
  }
};
