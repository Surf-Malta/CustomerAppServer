const axios = require("axios");

exports.loginWithEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required",
      });
    }

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://dev.surf.mt/api/2.0/NtOtpLoginApi",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic YWRtaW5Ac3VyZi5tdDpOOW9aMnlXMzc3cEg1VTExNTFiY3YyZlYyNDYySTk1NA==",
      },
      data: JSON.stringify({
        destination: email,
        verification_method: "email",
      }),
    };

    const response = await axios.request(config);

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
