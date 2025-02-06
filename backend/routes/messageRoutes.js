import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import {
  sendMessage,
  getMessages,
  getConversations,
  deleteConversation,
  deleteMessage,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/conversations", protectRoute, getConversations);
router.post("/", protectRoute, sendMessage);
router.get("/:otherUserId", protectRoute, getMessages);
router.delete("/:conversationId", deleteConversation);
router.delete("/:messageId", deleteMessage);

export default router;
