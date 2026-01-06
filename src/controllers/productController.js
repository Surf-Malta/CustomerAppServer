const axios = require("axios");
const config = require("../config/config");

exports.getProducts = async (req, res) => {
  try {
    const { csCartApi } = config;
    const { company_id, variant_id, user_id } = req.query;

    if (!company_id && !variant_id) {
      return res.status(400).json({
        status: "error",
        message: "company_id or variant_id is required",
      });
    }

    let apiUrl = `${csCartApi.baseUrl}/NtProductApi?user_id=${user_id || 128}`;

    if (company_id) {
      apiUrl += `&company_id=${company_id}`;
    }

    if (variant_id) {
      apiUrl += `&variant_id=${variant_id}`;
    }

    const authHeader =
      "Basic YWRtaW5Ac3VyZi5tdDpOOW9aMnlXMzc3cEg1VTExNTFiY3YyZlYyNDYySTk1NA==";

    const response = await axios.get(apiUrl, {
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
    console.error("Error fetching products:", error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({
      status: "error",
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};
