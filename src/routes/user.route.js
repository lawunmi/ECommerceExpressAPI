import express from "express";
import {
  createUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "../controllers/user.controller.js";
import { authentication } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.post("/createUser", createUser);
router.post("/login", loginUser);
router.get("/getUsers", authentication, adminMiddleware, getAllUsers);
router.get("/getUser/:id", authentication, adminMiddleware, getUserById);
router.put("/updateUser/:id", authentication, updateUser);
export default router;
