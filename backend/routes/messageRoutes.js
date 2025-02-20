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
router.delete("/:conversationId", protectRoute, deleteConversation);
router.delete("/delete/message", protectRoute, deleteMessage);

export default router;
