const axios = require("axios");

async function check() {
  const url = "http://localhost:3000/api/products/18500?user_id=326&image_width=600";
  console.log("Calling local server product details API:", url);
  try {
    const response = await axios.get(url);
    console.log("SUCCESS!");
    console.log("Product Name:", response.data.product);
    console.log("image_urls:", response.data.image_urls);
    console.log("main_pair:", JSON.stringify(response.data.main_pair, null, 2));
  } catch (error) {
    console.error("FAILED to call local product details API:", error.message);
  }
}

check().catch(console.error);
