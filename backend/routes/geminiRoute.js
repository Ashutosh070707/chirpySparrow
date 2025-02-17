import express from "express";
import { improveWithAi } from "../controllers/geminiController.js";

const router = express.Router();

router.post("/improve", improveWithAi);

export default router;
