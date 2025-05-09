import mongoose from "mongoose";

const followerSchema = mongoose.Schema(
  {
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      default: "",
    },
  },

  { _id: false } // To prevent creation of an extra _id field for each follower
);

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 1,
    },
    profilePic: {
      type: String,
      default: "",
    },
    followers: {
      type: [followerSchema],
      default: [],
    },
    following: {
      type: [followerSchema],
      default: [],
    },
    bio: {
      type: String,
      default: "",
    },
    isFrozen: {
      type: Boolean,
      default: false,
    },
    newMessageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema); // this line makes the new directry in the database named as users

export default User;
