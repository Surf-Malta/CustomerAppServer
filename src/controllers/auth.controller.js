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

    const authHeader =
      "Basic YWRtaW5Ac3VyZi5tdDpOOW9aMnlXMzc3cEg1VTExNTFiY3YyZlYyNDYySTk1NA==";

    const configPost = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${csCartApi.baseUrl}/NtOtpLoginApi`,
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
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
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
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
