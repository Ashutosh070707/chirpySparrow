import express from "express";
import {
  signupUser,
  loginUser,
  logoutUser,
  followUnfollowUser,
  updateUser,
  getUserProfile,
  getSuggestedUsers,
  freezeAccount,
  getSearchedUser,
  getNewMessagesCount,
  setNewMessagesCount,
} from "../controllers/userController.js";

import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/profile/:query", protectRoute, getUserProfile);
router.post("/searching/:username", protectRoute, getSearchedUser);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.get("/getNewMessagesCount", protectRoute, getNewMessagesCount);
router.put("/setNewMessagesCount", protectRoute, setNewMessagesCount);
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", protectRoute, logoutUser);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.put("/update/:id", protectRoute, updateUser);
router.put("/freeze", protectRoute, freezeAccount);

export default router;
