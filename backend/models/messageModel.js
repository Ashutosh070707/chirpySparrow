import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: {
      type: String,
      default: "",
    },
    seen: {
      type: Boolean,
      default: false,
    },
    img: {
      type: String,
      default: "",
    },
    gif: {
      type: String,
      default: "",
    },
    // Only snapshot data for reply
    replySnapshot: {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      text: { type: String, default: "" },
      img: { type: String, default: "" },
      gif: { type: String, default: "" },
      _id: false, // Prevent Mongoose from adding _id to subdoc
    },
    deletedBy: {
      type: Map,
      of: Boolean, // Store which user deleted the conversation
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
