import categoryModel from "../models/category.model.js";
import { sendSuccessResponse, sendErrorResponse } from "../utils/response.js";

const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // Validate required fields
    if (!name) {
      return sendErrorResponse(res, 400, "Name is required");
    }

    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return sendErrorResponse(res, 409, `Category ${name} already exists`);
    }

    // Create new category
    const newCategory = new categoryModel({ name, description });
    const savedCategory = await newCategory.save();

    const { __v, ...categoryInfo } = savedCategory.toObject();

    return sendSuccessResponse(
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
      return sendErrorResponse(res, 404, "Category not found");
    }

    const { __v, ...categoryInfo } = updatedCategory.toObject();

    return sendSuccessResponse(
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
      return sendErrorResponse(res, 404, "Category not found");
    }

    return sendSuccessResponse(res, 200, "Category deleted successfully");
  } catch (error) {
    next(error);
  }
};

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await categoryModel.find({}, "-__v");

    return sendSuccessResponse(
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
      return sendErrorResponse(res, 404, "Category not found");
    }

    return sendSuccessResponse(
      res,
      200,
      "Category retrieved successfully",
      category
    );
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
