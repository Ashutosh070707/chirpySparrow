import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    lastMessagePerUser: {
      type: Map,
      of: new mongoose.Schema({
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        gif: String,
        img: String,
        seen: { type: Boolean, default: false },
      }),
      default: {},
    },

    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    deletedBy: {
      type: Map,
      of: Boolean,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;

// lastMessage: {
//   sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   text: String,
//   gif: String,
//   img: String,
//   seen: {
//     type: Boolean,
//     default: false,
//   },
// },
