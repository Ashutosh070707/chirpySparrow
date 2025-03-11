import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import {
  sendMessage,
  getMessages,
  getConversations,
  deleteConversation,
  deleteMessage,
  getGifs,
  resetUnreadMessageCount,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/conversations", protectRoute, getConversations);
router.post("/", protectRoute, sendMessage);
router.post("/resetUnreadMessageCount", resetUnreadMessageCount);
router.get("/gifs/:encodedQuery", getGifs);
router.get("/:otherUserId", protectRoute, getMessages);
router.delete("/:conversationId", protectRoute, deleteConversation);
router.delete("/delete/message", protectRoute, deleteMessage);

export default router;
