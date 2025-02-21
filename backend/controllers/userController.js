import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import generateTokenandSetCookie from "../utils/helpers/generateTokenandSetCookie.js";
import { v2 as cloudinary } from "cloudinary";
// import { trie } from "../utils/algorithms/trie.js";

export const signupUser = async (req, res) => {
  try {
    const { name, username, password, email } = req.body;
    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json({ error: "User already exists." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
      profilePic: "",
      bio: "",
    });
    await newUser.save();

    // Insert the user into the Trie
    const userData = {
      _id: newUser._id,
      username: newUser.username,
      name: newUser.name,
      email: newUser.email,
      profilePic: newUser.profilePic,
    };
    // trie.insert(newUser.username, userData); // Insert into Trie

    if (newUser) {
      generateTokenandSetCookie(newUser._id, res);
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        profilePic: newUser.profilePic,
        bio: newUser.bio,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in signupUser", err.message);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect)
      return res.status(400).json({ error: "Invalid username or password." });

    // Insert the user into Trie if not already present (in case it's missed)
    const userData = {
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
    };
    // trie.insert(user.username, userData); // Insert into Trie if necessary

    if (user.isFrozen) {
      user.isFrozen = false;
      await user.save();
    }

    generateTokenandSetCookie(user._id, res);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      profilePic: user.profilePic,
      bio: user.bio,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in loginUser", err.message);
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ message: "Logged out successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in logoutUser", err.message);
  }
};

export const getUserProfile = async (req, res) => {
  const { query } = req.params;
  try {
    let user;
    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await User.findOne({ _id: query })
        .select("-password")
        .select("-updatedAt");
    } else {
      user = await User.findOne({ username: query })
        .select("-password")
        .select("-updatedAt");
    }

    if (!user) {
      res.status(400).json({ error: "User not found." });
      return;
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in getUserProfile", err.message);
  }
};

export const getSearchedUser = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username || username.trim() === "") {
      return res.status(400).json({ error: "Username parameter is required." });
    }

    // Search in Trie first
    // const searchedUsersFromTrie = trie.searchPrefix(username);

    // if (searchedUsersFromTrie.length > 0) {
    //   return res.status(200).json(searchedUsersFromTrie); // Return Trie results if found
    // }

    const searchedUsers = await User.find(
      {
        username: { $regex: `^${username}`, $options: "i" },
        isFrozen: false, // Only users who are not frozen
        // _id: { $ne: req.user._id },
      }, // Starts with, case-insensitive
      "_id username name email profilePic" // Fetch only necessary fields
    ).limit(50); // Limit the results for efficiency

    return res.status(200).json(searchedUsers);
  } catch (err) {
    console.error("Error in getSearchedUser:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const searchedUser = await User.findById(id);
    const loggedInUser = await User.findById(req.user._id);

    if (id.toString() === req.user._id.toString())
      return res
        .status(400)
        .json({ error: "You cannot follow/unfollow yourself." });

    if (!searchedUser || !loggedInUser)
      return res.status(400).json({ error: "User not found." });

    const isFollowing = loggedInUser.following.some(
      (followedUser) => followedUser.followerId.toString() === id.toString()
    );

    if (isFollowing) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: {
          following: {
            followerId: id,
          },
        },
      });
      await User.findByIdAndUpdate(id, {
        $pull: { followers: { followerId: req.user._id } },
      });
      res.status(200).json({ message: "User unfollowed successfully." });
    } else {
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          following: {
            followerId: id,
            name: searchedUser.name,
            username: searchedUser.username,
            profilePic: searchedUser.profilePic,
          },
        },
      });
      await User.findByIdAndUpdate(id, {
        $push: {
          followers: {
            followerId: req.user._id,
            name: loggedInUser.name,
            username: loggedInUser.username,
            profilePic: loggedInUser.profilePic,
          },
        },
      });
      res.status(200).json({ message: "User followed successfully." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in followUnfollow User", err.message);
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, username, password, bio } = req.body;
    let { profilePic } = req.body;
    const userId = req.user._id;

    let user = await User.findById(userId);
    if (!user) {
      res.status("400").json({ error: "User not found." });
    }

    if (!name || !email || !username) {
      return res
        .status(400)
        .json({ error: "Name, email, and username are required." });
    }

    if (req.params.id.toString() !== userId.toString()) {
      res
        .status(400)
        .json({ error: "You are not allowed to update other user details." });
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hassedPassword = await bcrypt.hash(password, salt);
      user.password = hassedPassword;
    }

    if (profilePic) {
      if (user.profilePic) {
        await cloudinary.uploader.destroy(
          user.profilePic.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(profilePic);
      profilePic = uploadedResponse.secure_url;
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.profilePic = profilePic || user.profilePic;
    user.bio = bio || user.bio;

    // Find All posts that this user replied and update username and userProfilePic fields
    await Post.updateMany(
      {
        "replies.userId": userId,
      },
      {
        $set: {
          "replies.$[reply].username": user.username,
          "replies.$[reply].userProfilePic": user.profilePic,
        },
      },
      { arrayFilters: [{ "reply.userId": userId }] }
    );

    user = await user.save();

    //password should be null in response
    user.password = null;

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      profilePic: user.profilePic,
      bio: user.bio,
    };
    res.status(200).json(userResponse);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in updateUser", err.message);
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const usersFollowedByYou = await User.findById(userId).select("following");

    const followingIds = usersFollowedByYou.following.map(
      (follow) => follow.followerId
    );
    // Fetch all users not followed by the current user
    const suggestedUsers = await User.find({
      _id: {
        $ne: userId, // Exclude the current user
        $nin: followingIds, // Exclude followed users
      },
      isFrozen: false, // Only users who are not frozen
    }).select(
      "-password -bio -followers -following -createdAt -email -isFrozen"
    ); // Exclude unwanted fields

    res.status(200).json(suggestedUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in getSuggestedUsers", err.message);
  }
};

export const freezeAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(400).json({ error: "User not Found" });
    }
    user.isFrozen = true;
    await user.save();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in freezeAccount", err.message);
  }
};
