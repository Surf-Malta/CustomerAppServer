const axios = require("axios");
const config = require("../config/config");

const commonHeaders = (authHeader) => ({
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
});

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

    const authHeader =
      "Basic YWRtaW5Ac3VyZi5tdDpOOW9aMnlXMzc3cEg1VTExNTFiY3YyZlYyNDYySTk1NA==";

    const configPost = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${csCartApi.baseUrl}/NtOtpLoginApi`,
      headers: commonHeaders(authHeader),
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
      console.error(error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      console.error(error.request);
      res.status(503).json({
        status: "error",
        message: "No response from external API",
      });
    } else {
      console.error("Error", error.message);
      res.status(500).json({
        status: "error",
        message: "Internal Server Error",
      });
    }
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const { csCartApi } = config;

    if (!email || !otp) {
      return res.status(400).json({
        status: "error",
        message: "Email and OTP are required",
      });
    }

    const authHeader =
      "Basic YWRtaW5Ac3VyZi5tdDpOOW9aMnlXMzc3cEg1VTExNTFiY3YyZlYyNDYySTk1NA==";

    const configPut = {
      method: "put",
      maxBodyLength: Infinity,
      url: `${csCartApi.baseUrl}/NtOtpLoginApi/1`,
      headers: commonHeaders(authHeader),
      data: JSON.stringify({
        email: email,
        otp: otp,
        verification_method: "email",
      }),
    };

    const response = await axios.request(configPut);

    // Forward the successful response from the external API
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in verifyOtp:", error.message);
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
