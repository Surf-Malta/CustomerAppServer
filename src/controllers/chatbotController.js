const surfyService = require("../services/surfyBackendService");

exports.handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res
        .status(400)
        .json({ status: "error", message: "Message is required" });
    }

    console.log(`[Chatbot] Processing: "${message}"`);
    const result = await surfyService.processChat(message);

    res.status(200).json({
      message: result.message,
      products: result.products,
      status: "success",
    });
  } catch (error) {
    console.error("[Chatbot Error] Final Catch:", error.stack);
    res.status(500).json({
      status: "error",
      message:
        "I'm having trouble processing your request. Please try again later.",
      error: error.message,
    });
  }
};
