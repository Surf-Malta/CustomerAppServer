const fs = require("fs");
const surfy = require("./src/services/surfyBackendService");

const LOG_FILE = "debug_run.log";

// Hijack console.log to write to file
const originalLog = console.log;
const originalError = console.error;

function logToFile(msg) {
  fs.appendFileSync(LOG_FILE, msg + "\n");
}

console.log = (...args) => {
  const msg = args
    .map((a) => (typeof a === "object" ? JSON.stringify(a) : a))
    .join(" ");
  logToFile(msg);
  originalLog.apply(console, args);
};

console.error = (...args) => {
  const msg = args
    .map((a) => (typeof a === "object" ? JSON.stringify(a) : a))
    .join(" ");
  logToFile("[ERROR] " + msg);
  originalError.apply(console, args);
};

async function test() {
  fs.writeFileSync(LOG_FILE, "--- START TEST ---\n");
  console.log("Testing 'Any iphones'...");
  try {
    const result = await surfy.processChat("Any iphones");
    console.log("Final Result: " + JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("Test Failed: " + e.stack);
  }
}

test();
