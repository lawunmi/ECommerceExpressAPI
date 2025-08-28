import express from "express";
import {
  addToCart,
  getCart,
  addToExistingCart,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller.js";
import { authentication } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/addToCart", authentication, addToCart);
router.get("/getCart", authentication, getCart);
router.put("/addItemToExistingCart/:id", authentication, addToExistingCart);
router.delete(
  "/removeItemFromCart/:cartId/:productId",
  authentication,
  removeFromCart
);
router.delete("/clearCart/:cartId", authentication, clearCart);

export default router;
