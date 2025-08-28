import express from "express";
import {
  createUser,
  loginUser,
  getAllUsers,
  getUser,
  updateUser,
  changePassword,
} from "../controllers/user.controller.js";
import { authentication } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.post("/createUser", createUser);
router.post("/login", loginUser);
router.get("/getUsers", authentication, adminMiddleware, getAllUsers);
router.get("/getUser", authentication, getUser);
router.patch("/updateUser", authentication, updateUser);
router.put("/changePassword", authentication, changePassword);
export default router;
