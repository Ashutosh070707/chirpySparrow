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
    // replyTo: {
    //   type: {
    //     messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" }, // Stores the original message ID
    //     text: { type: String, default: "" },
    //     img: { type: String, default: "" },
    //     gif: { type: String, default: "" },
    //   },
    //   default: null,
    // },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
