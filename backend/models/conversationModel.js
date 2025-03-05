import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    lastMessage: {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: String,
      gif: String,
      img: String,
      seen: {
        type: Boolean,
        default: false,
      },
    },
    unreadCount: {
      type: Map,
      of: Number, // Store unread messages count for each user
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
