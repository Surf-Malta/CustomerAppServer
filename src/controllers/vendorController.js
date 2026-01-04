const axios = require("axios");
const config = require("../config/config");

exports.getVendors = async (req, res) => {
  const { csCartApi } = config;
  const authHeader = `Basic ${Buffer.from(
    `${csCartApi.username}:${csCartApi.apiKey}`
  ).toString("base64")}`;

  const headers = {
    Authorization: authHeader,
    "Content-Type": "application/json",
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
  };

  try {
    const apiUrl = `${csCartApi.baseUrl}/NtVendorsApi/`;
    console.log(`Trying vendors from: ${apiUrl}`);
    const response = await axios.get(apiUrl, { headers });
    console.log("Vendors fetched successfully from NtVendorsApi");
    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log("NtVendorsApi not found, trying NtCompaniesApi...");
      try {
        const fallbackUrl = `${csCartApi.baseUrl}/NtCompaniesApi/`;
        const fallbackResponse = await axios.get(fallbackUrl, { headers });
        console.log("Vendors fetched successfully from NtCompaniesApi");
        return res.status(200).json(fallbackResponse.data);
      } catch (fallbackError) {
        if (fallbackError.response && fallbackError.response.status === 404) {
          console.log("NtCompaniesApi not found, trying NtVendorApi...");
          try {
            const finalFallbackUrl = `${csCartApi.baseUrl}/NtVendorApi/`;
            const finalResponse = await axios.get(finalFallbackUrl, {
              headers,
            });
            console.log("Vendors fetched successfully from NtVendorApi");
            return res.status(200).json(finalResponse.data);
          } catch (finalError) {
            console.error(
              "Error fetching from NtVendorApi:",
              finalError.message
            );
          }
        }
        console.error(
          "Error fetching from NtCompaniesApi:",
          fallbackError.message
        );
      }
    }

    console.error("Error fetching vendors:", error.message);
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
