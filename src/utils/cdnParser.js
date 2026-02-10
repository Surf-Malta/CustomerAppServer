const config = require("../config/config");

/**
 * Recursively traverses an object or array and rewrites image URLs to use the CDN.
 * @param {any} data - The data to traverse.
 * @returns {any} - The data with rewritten image URLs.
 */
const rewriteImageUrls = (data) => {
  if (!config.cdnUrl) return data;

  if (typeof data === "string") {
    // Check if the string is an image URL from surf.mt
    if (data.includes("https://dev.surf.mt/images/")) {
      return data.replace(
        "https://dev.surf.mt/images/",
        `${config.cdnUrl}/images/`,
      );
    }
    // Also check for http
    if (data.includes("http://dev.surf.mt/images/")) {
      return data.replace(
        "http://dev.surf.mt/images/",
        `${config.cdnUrl}/images/`,
      );
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => rewriteImageUrls(item));
  }

  if (typeof data === "object" && data !== null) {
    const newData = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newData[key] = rewriteImageUrls(data[key]);
      }
    }
    return newData;
  }

  return data;
};

module.exports = { rewriteImageUrls };
