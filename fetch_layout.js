const axios = require("axios");
const fs = require("fs");

async function fetchLayout() {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/layout/home-layout?image_width=20"
    );
    console.log("Keys:", Object.keys(response.data));
    console.log(
      "Date Sample:",
      JSON.stringify(response.data, null, 2).substring(0, 500)
    );
    fs.writeFileSync(
      "layout_dump.json",
      JSON.stringify(response.data, null, 2)
    );
  } catch (error) {
    console.error("Error:", error.message);
  }
}

fetchLayout();
