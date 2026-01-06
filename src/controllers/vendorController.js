const axios = require("axios");
const config = require("../config/config");

exports.getVendors = async (req, res) => {
  const { csCartApi } = config;
  const authHeader =
    "Basic YWRtaW5Ac3VyZi5tdDpOOW9aMnlXMzc3cEg1VTExNTFiY3YyZlYyNDYySTk1NA==";

  const headers = {
    Authorization: authHeader,
    "Content-Type": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "*/*",
  };

  try {
    const apiUrl = `${csCartApi.baseUrl}/NtCompaniesApi/`;
    console.log(`Fetching vendors from: ${apiUrl}`);
    const response = await axios.get(apiUrl, { headers });
    console.log("Vendors fetched successfully from NtCompaniesApi");

    // Ensure consistent response format for the frontend
    // The API returns { vendors: [...] }
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching vendors from NtCompaniesApi:", error.message);

    // Fallback logic if needed, but the primary is now NtCompaniesApi
    if (error.response && error.response.status === 404) {
      try {
        const fallbackUrl = `${csCartApi.baseUrl}/NtVendorsApi/`;
        const fallbackResponse = await axios.get(fallbackUrl, { headers });
        return res.status(200).json(fallbackResponse.data);
      } catch (fallbackError) {
        console.error(
          "Fallback to NtVendorsApi failed:",
          fallbackError.message
        );
      }
    }

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({
      status: "error",
      message: "Failed to fetch vendors",
      error: error.message,
    });
  }
};
