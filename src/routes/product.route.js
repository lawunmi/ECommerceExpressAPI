import express from "express";
import { authentication } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProductById,
} from "../controllers/product.controller.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.post(
  "/createProduct",
  authentication,
  adminMiddleware,
  upload.array("productImages"),
  createProduct
);
router.get("/getAllProducts", getAllProducts);
router.get("/getProductByID/:id", getProductById);
router.put(
  "/updateProduct/:id",
  authentication,
  adminMiddleware,
  upload.array("productImages"),
  updateProduct
);
router.delete(
  "/deleteProductByID/:id",
  authentication,
  adminMiddleware,
  deleteProductById
);

export default router;
