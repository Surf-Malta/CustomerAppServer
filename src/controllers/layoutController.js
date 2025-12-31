const axios = require("axios");

exports.getHomeLayout = async (req, res) => {
  try {
    const { image_width } = req.query;
    // Hardcoded user_id as per instructions
    const user_id = 2;

    // Construct the external API URL
    const apiUrl = `https://dev.surf.mt/api/2.0/NtHomepageLayoutApi?image_width=${
      image_width || 20
    }&user_id=${user_id}`;

    // Basic Auth matching the curl command provided
    // Authorization: Basic YWRtaW5Ac3VyZi5tdDpOOW9aMnlXMzc3cEg1VTExNTFiY3YyZlYyNDYySTk1NA==
    const authHeader =
      "Basic YWRtaW5Ac3VyZi5tdDpOOW9aMnlXMzc3cEg1VTExNTFiY3YyZlYyNDYySTk1NA==";

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: authHeader,
      },
    });

    // Forward the data to the client
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching home layout:", error.message);
    if (error.response) {
      console.error("External API Status:", error.response.status);
      console.error("External API Data:", error.response.data);
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({
      status: "error",
      message: "Failed to fetch home layout",
      error: error.message,
    });
  }
};
