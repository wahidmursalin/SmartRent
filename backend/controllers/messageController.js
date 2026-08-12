const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// @route  POST /api/messages/start
// @desc   Find or create a conversation with another user (optionally about a house)
// @access Private
const startConversation = async (req, res) => {
  try {
    const { recipientId, houseId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ message: "recipientId is required" });
    }

    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot start a conversation with yourself" });
    }

    const query = {
      participants: { $all: [req.user._id, recipientId], $size: 2 },
    };
    if (houseId) query.house = houseId;

    let conversation = await Conversation.findOne(query);

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
        house: houseId || undefined,
      });
    }

    conversation = await conversation.populate([
      { path: "participants", select: "name email role" },
      { path: "house", select: "title" },
    ]);

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/messages/conversations
// @desc   List all conversations for the logged-in user, with unread counts
// @access Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate("participants", "name email role")
      .populate("house", "title")
      .sort({ lastMessageAt: -1 });

    const withUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: req.user._id },
          read: false,
        });
        return { ...conv.toObject(), unreadCount };
      })
    );

    res.json(withUnread);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/messages/:conversationId
// @desc   Get all messages in a conversation (marks incoming ones as read)
// @access Private (participant only)
const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.participants.some((p) => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "Not authorized to view this conversation" });
    }

    const messages = await Message.find({ conversation: req.params.conversationId })
      .populate("sender", "name role")
      .sort({ createdAt: 1 });

    await Message.updateMany(
      { conversation: req.params.conversationId, sender: { $ne: req.user._id }, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  POST /api/messages/:conversationId
// @desc   Send a message in a conversation
// @access Private (participant only)
const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.participants.some((p) => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "Not authorized to message in this conversation" });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text: text.trim(),
    });

    conversation.lastMessage = text.trim();
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populated = await message.populate("sender", "name role");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { startConversation, getConversations, getMessages, sendMessage };
