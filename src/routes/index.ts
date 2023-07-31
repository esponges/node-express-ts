import express from "express";
import chatRoutes from "./chat";

const router = express.Router();

router.use("/chat", chatRoutes);

export default router;
