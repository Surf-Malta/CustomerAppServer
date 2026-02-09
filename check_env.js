console.log("--- ENV DIAGNOSTIC ---");
console.log("Node version:", process.version);
console.log("OS:", process.platform, process.arch);
console.log("Versions:", JSON.stringify(process.versions, null, 2));

try {
  const express = require("express");
  console.log("Express location:", require.resolve("express"));
} catch (e) {
  console.log("Express NOT found");
}

try {
  const url = require("node:url");
  console.log("URL module:", url.parse.toString().substring(0, 100));
} catch (e) {
  console.log("URL module NOT found");
}

console.log(
  "Global variables:",
  Object.keys(global).filter((k) => !k.startsWith("_")),
);
