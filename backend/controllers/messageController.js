import dotenv from "dotenv";
dotenv.config();

import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import { getRecipientSocketId } from "../socket/socket.js";
import {
  io,
  activeChatUsers,
  userActiveConversations,
} from "../socket/socket.js";
import { v2 as cloudinary } from "cloudinary";
import User from "../models/userModel.js";

export const sendMessage = async (req, res) => {
  try {
    const { recipientId, message, gif, replySnapshot } = req.body;
    let { img } = req.body;
    const senderId = req.user._id;

    const countSelected = [!!message, !!img, !!gif].filter(Boolean).length;
    if (countSelected > 1) {
      return res
        .status(400)
        .json({ error: "Only one input is allowed at a time" });
    }
    if (img) {
      try {
        const uploadedResponse = await cloudinary.uploader.upload(img);
        img = uploadedResponse.secure_url;
      } catch (error) {
        return res.status(500).json({ error: "Image upload failed" });
      }
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId],
        lastMessage: {
          text: message || "",
          gif: gif || "",
          img: img || "",
          sender: senderId,
          seen: false,
        },
        unreadCount: new Map([[recipientId, 1]]),
        deletedBy: new Map(),
      });
    } else {
      if (conversation.deletedBy.has(senderId.toString())) {
        conversation.deletedBy.delete(senderId.toString());
      }

      const recipientHasDeleted = conversation.deletedBy.has(
        recipientId.toString()
      );

      if (recipientHasDeleted) {
        conversation.deletedBy.delete(recipientId.toString());
        conversation.unreadCount.set(recipientId.toString(), 0);
      }

      if (
        userActiveConversations.get(recipientId.toString()) !==
        conversation._id.toString()
      ) {
        const currentCount =
          conversation.unreadCount.get(recipientId.toString()) || 0;
        conversation.unreadCount.set(recipientId.toString(), currentCount + 1);
      }
    }

    // Save the conversation with updated values
    await conversation.save();

    const newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      text: message || "",
      img: img || "",
      gif: gif || "",
      replySnapshot: replySnapshot,
    });

    await Promise.all([
      newMessage.save(),
      conversation.updateOne({
        lastMessage: {
          text: message || "",
          sender: senderId,
          img: img || "",
          gif: gif || "",
          seen: false,
        },
      }),
    ]);

    const recipientSocketId = getRecipientSocketId(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newMessage", newMessage);

      io.to(recipientSocketId).emit("conversationUpdated", {
        conversationId: conversation._id,
        lastMessage: {
          text: message || "",
          sender: senderId,
          img: img || "",
          gif: gif || "",
          seen: false,
        },
      });

      io.to(recipientSocketId).emit("updateUnreadCount", {
        conversationId: conversation._id,
        unreadCount: conversation.unreadCount.get(recipientId.toString()) || 0,
      });
    }

    if (!activeChatUsers?.has(recipientId)) {
      const user = await User.findByIdAndUpdate(
        recipientId,
        { $inc: { newMessageCount: 1 } },
        { new: true }
      );
      if (recipientSocketId) {
        io.to(recipientSocketId).emit(
          "updateNewMessagesCount",
          user.newMessageCount
        );
      }
    }

    res.status(200).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMessages = async (req, res) => {
  const { otherUserId } = req.params;
  const userId = req.user._id;
  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
    });

    if (!conversation)
      return res.status(500).json({ error: "Conversation not found." });
    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getConversations = async (req, res) => {
  const userId = req.user._id;
  try {
    const conversations = await Conversation.find({
      participants: userId,
    }).populate({ path: "participants", select: "name username profilePic" });

    // Filter out conversations that the user has deleted
    const filteredConversations = conversations.filter(
      (conversation) => !conversation.deletedBy?.get(userId.toString())
    );

    filteredConversations.forEach((conversation) => {
      conversation.participants = conversation.participants.filter(
        (participant) => participant._id.toString() !== userId.toString()
      );
    });
    res.status(200).json(filteredConversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteConversation = async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id.toString();
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    conversation.deletedBy.set(userId, true);
    conversation.unreadCount.set(userId, 0);
    await conversation.save();

    // Check if all participants have deleted the conversation
    const allDeleted = conversation.participants.every((participantId) => {
      const id = participantId.toString();
      return (
        conversation.deletedBy.has(id) &&
        conversation.deletedBy.get(id) === true
      );
    });

    if (allDeleted) {
      const messages = await Message.find({ conversationId });
      for (const message of messages) {
        if (message.img) {
          const publicId = message.img.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        }
      }
      await Message.deleteMany({ conversationId });
      await Conversation.findByIdAndDelete(conversationId);
    }

    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  const { messageId, selectedConversationId, recipientId } = req.body;
  const userId = req.user._id.toString();

  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    const conversation = await Conversation.findById(
      message.conversationId.toString()
    );
    if (!conversation) {
      return res
        .status(404)
        .json({ message: "Conversation of this message not exist." });
    }
    message.deletedBy.set(userId, true);
    await message.save();

    if (message.img) {
      await cloudinary.uploader.destroy(
        message.img.split("/").pop().split(".")[0]
      );
    }

    await Message.findByIdAndDelete(messageId);

    const latestMessage = await Message.findOne({
      conversationId: selectedConversationId,
    }).sort({ createdAt: -1 });

    const updatedLastMessage = latestMessage
      ? {
          text: latestMessage.text,
          img: latestMessage.img,
          gif: latestMessage.gif,
          sender: latestMessage.sender,
          seen: latestMessage.seen,
        }
      : { text: "", img: "", gif: "" };

    await Conversation.findByIdAndUpdate(selectedConversationId, {
      $set: { lastMessage: updatedLastMessage },
    });

    io.to(getRecipientSocketId(message.sender)).emit("messageDeleted", {
      messageId,
      selectedConversationId,
      updatedLastMessage,
    });
    io.to(getRecipientSocketId(recipientId)).emit("messageDeleted", {
      messageId,
      selectedConversationId,
      updatedLastMessage,
    });

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getGifs = async (req, res) => {
  const { encodedQuery } = req.params;
  try {
    const BASE_URL = `https://tenor.googleapis.com/v2/search?q=${encodedQuery}&key=${process.env.TENOR_API_KEY}&client_key=chirpysparrow&limit=12`;

    const response = await fetch(BASE_URL);
    if (!response.ok) throw new Error("Failed to fetch GIFs");

    const data = await response.json();
    res.status(200).json({ results: data.results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const resetUnreadMessageCount = async (req, res) => {
  const { conversationId, userId } = req.body;
  try {
    const result = await Conversation.findByIdAndUpdate(
      conversationId,
      { $set: { [`unreadCount.${userId}`]: 0 } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
