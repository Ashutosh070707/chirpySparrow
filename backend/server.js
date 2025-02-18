import express from "express";
import path from "path";
import dotenv from "dotenv";
import { connectDB } from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import geminiRoutes from "./routes/geminiRoute.js";
import { v2 as cloudinary } from "cloudinary";
import { app, io, server } from "./socket/socket.js";
import User from "./models/userModel.js";
import { trie } from "./utils/algorithms/trie.js";
// import job from "./cron/cron.js";
dotenv.config();
connectDB();
// job.start(); // adding crons features( make a get request every 14 minutes)

const PORT = process.env.PORT || 5000;
// const __dirname = path.resolve();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Load usernames and details into Trie before starting the server
const loadUsersIntoTrie = async () => {
  try {
    const users = await User.find({}, "username name email profilePic"); // Fetch additional user data
    users.forEach((user) => {
      const userData = {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      };
      trie.insert(user.username, userData); // Insert username along with user data
    });
    console.log("Trie initialized with usernames and additional user data.");
  } catch (error) {
    console.error("Error initializing Trie:", error);
  }
};

// middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/gemini", geminiRoutes);

// ✅ Start the server after loading Trie
loadUsersIntoTrie().then(() => {
  server.listen(PORT, () =>
    console.log(`🚀 Server started at http://localhost:${PORT}`)
  );
});

// server.listen(PORT, () =>
//   console.log(`server stated at http://localhost:${PORT} `)
// );

// package.json before dployment ::::::::::::::::::::::
// "scripts": {
//     "dev": "nodemon server.js",
//     "start": "node server.js"
//   },

// package.json  for deployment :::::::::::::::::::::
// "scripts": {
//   "dev": "cross-env NODE_ENV=development nodemon backend/server.js",
//   "start": "cross-env NODE_ENV=production node backend/server.js",
//   "build": "npm install && npm install --prefix frontend && npm run build --prefix frontend"
// },

// These code is for deployment::::::::::::::
// http://localhost:5000 => backend, frontend
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "/frontend/dist")));

//   // Fallback to index.html for SPA
//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
//   });
// }
