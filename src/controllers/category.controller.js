import categoryModel from "../models/category.model.js";
import { sendSuccessResponse, sendErrorResponse } from "../utils/response.js";

const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // Validate required fields
    if (!name) {
      sendErrorResponse(res, 400, "Name is required");
    }

    // Create new category
    const newCategory = new categoryModel({ name, description });
    const savedCategory = await newCategory.save();

    const { __v, ...categoryInfo } = savedCategory.toObject();

    sendSuccessResponse(
      res,
      201,
      "Category created successfully",
      categoryInfo
    );
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const categoryUpdate = req.body;

    // Update category in database
    const updatedCategory = await categoryModel.findByIdAndUpdate(
      id,
      categoryUpdate,
      {
        new: true,
      }
    );

    if (!updatedCategory) {
      sendErrorResponse(res, 404, "Category not found");
    }

    const { __v, ...categoryInfo } = updatedCategory.toObject();

    sendSuccessResponse(
      res,
      201,
      "Category updated successfully",
      categoryInfo
    );
  } catch (error) {
    next(error);
  }
};

const deleteCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedCategory = await categoryModel.findByIdAndDelete(id);

    if (!deletedCategory) {
      sendErrorResponse(res, 404, "Category not found");
    }

    sendSuccessResponse(res, 200, "Category deleted successfully");
  } catch (error) {
    next(error);
  }
};

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await categoryModel.find({}, "-__v");

    sendSuccessResponse(
      res,
      200,
      "Category retrieved successfully",
      categories
    );
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findById(id, "-__v");

    if (!category) {
      sendErrorResponse(res, 404, "Category not found");
    }

    sendSuccessResponse(res, 200, "Category retrieved successfully", category);
  } catch (error) {
    next(error);
  }
};

export {
  createCategory,
  updateCategory,
  deleteCategoryById,
  getAllCategories,
  getCategoryById,
};
