const express = require("express");
const router = express.Router();
const {
  startConversation,
  getConversations,
  getMessages,
  sendMessage,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

router.post("/start", protect, startConversation);
router.get("/conversations", protect, getConversations);
router.get("/:conversationId", protect, getMessages);
router.post("/:conversationId", protect, sendMessage);

module.exports = router;
