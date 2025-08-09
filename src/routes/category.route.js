import express from "express";
import {
  createCategory,
  updateCategory,
  deleteCategoryById,
  getAllCategories,
  getCategoryById,
} from "../controllers/category.controller.js";
import { authentication } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.post("/createCategory", authentication, adminMiddleware, createCategory);
router.put(
  "/updateCategory/:id",
  authentication,
  adminMiddleware,
  updateCategory
);
router.delete(
  "/deleteCategoryByID/:id",
  authentication,
  adminMiddleware,
  deleteCategoryById
);
router.get("/getCategories", getAllCategories);
router.get("/getCategoryByID/:id", getCategoryById);

export default router;
