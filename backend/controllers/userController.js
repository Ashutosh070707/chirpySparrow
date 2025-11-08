import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import generateTokenandSetCookie from "../utils/helpers/generateTokenandSetCookie.js";
import { v2 as cloudinary } from "cloudinary";

// create new user. create a cookie in response and return details of the new user.
export const signupUser = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    // --- 1. Basic Input Validation ---

    // 1.1. Check for missing fields
    if (!fullName || !username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Please fill all required fields." });
    }

    // 1.2. Username validation:
    // - Continuous (no spaces)
    // - Only characters, numbers, underscore, and hyphen allowed (to cover common special chars)
    // - Minimum length (e.g., 3)
    const usernameRegex = /^[a-z0-9_-]+$/;
    if (!usernameRegex.test(username) || username.length < 3) {
      return res.status(400).json({
        error:
          "Username must be at least 3 characters long, continuous (no spaces), and contain only lowercase letters, numbers, hyphens, or underscores.",
      });
    }

    // 1.3. Password validation:
    // - No capital letters allowed (must be all lowercase, numbers, and allowed special characters)
    // - Minimum length (e.g., 6)
    // - Allowed characters: lowercase letters, numbers, and common special characters
    const passwordRegex = /^[a-z0-9!@#$%^&*()_+]{6,}$/;
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long." });
    }
    if (/[A-Z]/.test(password)) {
      // Simple check for any capital letter
      return res
        .status(400)
        .json({ error: "Password must not contain any capital letters." });
    }
    // Check to ensure NO disallowed characters are present
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: "Password contains disallowed characters or formatting issues.",
      });
    }

    // 1.4. Email validation: Basic format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ error: "Please enter a valid email address." });
    }

    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json({ error: "User already exists." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name: fullName,
      email,
      username,
      password: hashedPassword,
      profilePic: "",
      bio: "",
    });
    await newUser.save();

    if (newUser) {
      generateTokenandSetCookie(newUser._id, res);
      res.status(201).json({
        _id: newUser._id,
        name: newUser.fullName,
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

// check user exists and its credentials. if correct, create a cookie in response and return details of the user.
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    // --- 1. Basic Input Validation (Same as signup) ---

    // 1.1. Check for missing fields
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Please fill all required fields." });
    }

    // 1.2. Username validation:
    const usernameRegex = /^[a-z0-9_-]+$/;
    if (!usernameRegex.test(username) || username.length < 3) {
      return res.status(400).json({
        error: "Invalid username format.", // Keep error generic for security
      });
    }

    // 1.3. Password validation:
    // We only check for min length and invalid chars, NOT the 'no capital' rule
    // because the user might have logged in via email/phone and their password could contain capitals.
    const passwordRegex = /^[a-z0-9!@#$%^&*()_+]{6,}$/;
    if (password.length < 6 || !passwordRegex.test(password)) {
      // Check for min length OR disallowed characters
      return res.status(400).json({ error: "Invalid password format." });
    }

    // --- 2. Authentication Logic (Original Logic) ---
    const user = await User.findOne({ username });

    // Note: The logic for checking password format (e.g., no capitals) is **NOT** included here
    // because a user's existing password might contain characters that the current
    // signup policy disallows (like capital letters), but we must allow them to log in
    // with their established password. We only check for basic security constraints (min length).

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect)
      return res.status(400).json({ error: "Invalid username or password." });

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
      res.status(400).json({ error: "User not found." });
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

export const getNewMessagesCount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not Found" });
    }
    res.status(200).json({ count: user.newMessageCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in getNewMessageCount", err.message);
  }
};

export const setNewMessagesCount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not Found" });
    }
    user.newMessageCount = 0;
    await user.save();
    res.status(200).json({ count: user.newMessageCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in setNewMessageCount", err.message);
  }
};
