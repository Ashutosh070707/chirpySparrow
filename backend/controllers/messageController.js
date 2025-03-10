import dotenv from "dotenv";
dotenv.config();

import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import { getRecipientSocketId } from "../socket/socket.js";
import { io, activeChatUsers } from "../socket/socket.js";
// import { io } from "../socket/socket.js";
import { v2 as cloudinary } from "cloudinary";
import User from "../models/userModel.js";

export const sendMessage = async (req, res) => {
  try {
    const { recipientId, message, gif } = req.body;
    let { img } = req.body;
    const senderId = req.user._id;

    // Ensure only one input is present
    const countSelected = [!!message, !!img, !!gif].filter(Boolean).length;
    if (countSelected > 1) {
      return res
        .status(400)
        .json({ error: "Only one input is allowed at a time" });
    }

    // Upload image before proceeding
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
        },
      });
    }
    await conversation.save();

    const newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      text: message || "",
      img: img || "",
      gif: gif || "",
    });

    await Promise.all([
      newMessage.save(),
      conversation.updateOne({
        lastMessage: {
          text: message || "",
          sender: senderId,
          img: img,
          gif: gif,
          seen: false,
        },
      }),
    ]);

    // In your sendMessage controller, after updating the conversation
    const recipientSocketId = getRecipientSocketId(recipientId);
    if (recipientSocketId) {
      // Emit newMessage as before
      io.to(recipientSocketId).emit("newMessage", newMessage);

      // Add this new emit for conversation update
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
    }

    if (!activeChatUsers?.has(recipientId)) {
      const user = await User.findByIdAndUpdate(
        recipientId,
        { $inc: { newMessageCount: 1 } },
        { new: true } // Ensure updated value is returned
      );
      if (recipientSocketId) {
        io.to(recipientSocketId).emit(
          "updateMessageCount",
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

    // remove the current user from the participants list
    conversations.forEach((conversation) => {
      conversation.participants = conversation.participants.filter(
        (participant) => participant._id.toString() !== userId.toString()
      );
    });
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteConversation = async (req, res) => {
  const { conversationId } = req.params;
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await Message.find({ conversationId });
    for (const message of messages) {
      if (message.img) {
        // Delete the image from Cloudinary
        await cloudinary.uploader.destroy(
          message.img.split("/").pop().split(".")[0]
        );
      }
    }

    await Message.deleteMany({ conversationId });
    await Conversation.findByIdAndDelete(conversationId);
    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  const { messageId, selectedConversationId, recipientId } = req.body;

  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.img) {
      await cloudinary.uploader.destroy(
        message.img.split("/").pop().split(".")[0]
      );
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    // Fetch the latest message after deletion
    const latestMessage = await Message.findOne({
      conversationId: selectedConversationId,
    }).sort({ createdAt: -1 });

    const updatedLastMessage = latestMessage
      ? {
          text: latestMessage.text,
          img: latestMessage.img,
          sender: latestMessage.sender,
        }
      : { text: "", img: "" };

    await Conversation.findByIdAndUpdate(selectedConversationId, {
      $set: { lastMessage: updatedLastMessage },
    });

    // Emit delete event to both users
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
