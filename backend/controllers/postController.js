import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const { postedBy, text } = req.body;
    let { img } = req.body;
    if (!postedBy || !text) {
      return res
        .status(400)
        .json({ error: "PostedBy and text fields are required." });
    }

    const user = await User.findById(postedBy);
    if (!user) {
      return res.status(400).json({ error: "User not found." });
    }

    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized to create posts." });
    }

    const maxLength = 500;
    if (text.length > maxLength) {
      return res
        .status(400)
        .json({ error: `Text must be less than ${maxLength} characters.` });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({ postedBy, text, img });
    await newPost.save();
    res.status(200).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in createPost", err.message);
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(400).json({ error: "Post not found." });
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in getPost", err.message);
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(400).json({ error: "Post not found." });

    if (post.postedBy.toString() !== req.user._id.toString()) {
      return res.status(400).json({ error: "Unauthorized to delete post." });
    }

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in deletePost", err.message);
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({ error: "Post not found." });
    }

    if (post.postedBy.toString() === userId.toString()) {
      return res
        .status(400)
        .json({ error: "Cannnot like/unlike your own post." });
    }

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      res.status(200).json({ message: "Post unliked successfully." });
    } else {
      post.likes.push(userId);
      await post.save();
      res.status(200).json({ message: "Post liked successfully." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in likeUnlikePost", err.message);
  }
};

export const replyToPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    const userProfilePic = req.user.profilePic;
    const username = req.user.username;

    if (!text)
      return res.status(400).json({ error: "Text field is required." });

    const post = await Post.findById(postId);
    if (!post) return res.status(400).json({ error: "Post doesn't exist." });

    // Check if the user is replying to their own post
    if (post.postedBy.toString() === userId.toString()) {
      return res.status(400).json({ error: "Cannot reply to your own post." });
    }

    const reply = { userId, text, userProfilePic, username };

    post.replies.push(reply);
    await post.save();
    res.status(200).json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in replyToPost", err.message);
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "User not found" });

    const userPosts = await Post.find({ postedBy: user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(userPosts);
  } catch (err) {
    res.status(400).json({ error: err.message });
    console.log("Error in getUserPosts", err.message);
  }
};

export const getFeedPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(userId);

    if (!user) return res.status(400).json({ error: "User not found." });

    const following = user.following.map((follow) => follow.followerId);

    const feedPosts = await Post.find({ postedBy: { $in: following } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json(feedPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in getFeedPost", err.message);
  }
};

export const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { newText, newImg, imageChanged } = req.body;

    const olderPost = await Post.findById(postId);
    if (!olderPost) {
      return res.status(400).json({ error: "Post not found." });
    }
    if (!newText) {
      return res.status(400).json({ error: "Text is required." });
    }

    let updatedImg = olderPost.img; // Default to old image
    if (imageChanged) {
      if (olderPost.img) {
        await cloudinary.uploader.destroy(
          olderPost.img.split("/").pop().split(".")[0]
        );
      }
      if (newImg) {
        if (olderPost.img) {
          await cloudinary.uploader.destroy(
            olderPost.img.split("/").pop().split(".")[0]
          );
        }
        const uploadedResponse = await cloudinary.uploader.upload(newImg);
        updatedImg = uploadedResponse.secure_url;
      } else {
        updatedImg = "";
      }
    }

    olderPost.text = newText;
    olderPost.img = updatedImg;
    await olderPost.save();
    res
      .status(200)
      .json({ message: "Post updated successfully.", post: olderPost });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in update post.", err.message);
  }
};
