const surfyService = require("../services/surfyBackendService");
const { rewriteImageUrls } = require("../utils/cdnParser");

exports.handleChat = async (req, res) => {
  try {
    const { message, user_id } = req.body;
    if (!message) {
      return res
        .status(400)
        .json({ status: "error", message: "Message is required" });
    }

    console.log(`[Chatbot] Processing: "${message}" for session: "${user_id || "default"}"`);
    const result = await surfyService.processChat(message, user_id || "default");

    //product response
    res.status(200).json({
      message: result.message,
      products: rewriteImageUrls(result.products),
      status: "success",
    });

    //catgeory response
    // res.status(200).json({
    //   message: result.message,
    //   categories: result.relevantCategories,
    //   status: "success",
    // });

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
