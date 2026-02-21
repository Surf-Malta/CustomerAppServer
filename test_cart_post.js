const axios = require("axios");
require("dotenv").config();

const config = {
  csCartApi: {
    baseUrl: process.env.CS_CART_API_URL,
    username: process.env.CS_CART_USERNAME,
    apiKey: process.env.CS_CART_API_KEY,
  },
};

async function testAddToCart() {
  const { csCartApi } = config;
  const apiUrl = `${csCartApi.baseUrl}/NtCartApi`;

  const authHeader = `Basic ${Buffer.from(
    `${csCartApi.username}:${csCartApi.apiKey}`,
  ).toString("base64")}`;

  const payload = {
    user_id: "171",
    product_data: [
      {
        amount: 1,
        product_id: "19602",
      },
    ],
  };

  console.log("Testing Add to Cart...");
  console.log("URL:", apiUrl);
  console.log("Auth Header:", authHeader);
  console.log("Payload:", JSON.stringify(payload));

  try {
    const response = await axios.post(apiUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "*/*",
      },
    });

    console.log("SUCCESS!");
    console.log("Status:", response.status);
    console.log("Data:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log("FAILED!");
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.log("Error:", error.message);
    }
  }
}

testAddToCart();
