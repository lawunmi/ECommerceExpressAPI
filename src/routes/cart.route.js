import express from "express";
import {
  createCart,
  getCart,
  updateCart,
  deleteCart,
} from "../controllers/cart.controller.js";
import { authentication } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/createCart", authentication, createCart);
router.get("/getCart", authentication, getCart);
router.put("/updateCart/:id", authentication, updateCart);
router.delete("/deleteCartByID/:id", authentication, deleteCart);

export default router;
