const { rewriteImageUrls } = require("./src/utils/cdnParser");
require("dotenv").config();

// Mock config for testing
const config = require("./src/config/config");
config.cdnUrl = "https://surf-images.b-cdn.net";

const mockData = {
  products: [
    {
      product_id: 1,
      main_pair: {
        detailed: {
          image_path: "https://dev.surf.mt/images/detailed/1/product.jpg",
        },
      },
    },
    {
      product_id: 2,
      image_pairs: [
        {
          detailed: {
            image_path: "http://dev.surf.mt/images/detailed/2/product2.jpg",
          },
        },
      ],
    },
  ],
  sometext: "Just a string",
  someurl: "https://google.com/image.png",
};

console.log("Original Data Base URL:", "https://dev.surf.mt/images/");
console.log("Target CDN URL:", config.cdnUrl);

const rewritten = rewriteImageUrls(mockData);

console.log("\n--- Testing Rewrite ---");
const img1 = rewritten.products[0].main_pair.detailed.image_path;
const img2 = rewritten.products[1].image_pairs[0].detailed.image_path;

console.log("Image 1 Rewritten:", img1);
console.log("Image 2 Rewritten:", img2);

if (img1.startsWith(config.cdnUrl) && img2.startsWith(config.cdnUrl)) {
  console.log("\nSUCCESS: URLs rewritten correctly.");
} else {
  console.error("\nFAILURE: URLs not rewritten correctly.");
  process.exit(1);
}
