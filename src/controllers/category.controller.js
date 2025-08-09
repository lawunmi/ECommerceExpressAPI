import categoryModel from "../models/category.model.js";

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        status: "fail",
        message: "Name is required",
      });
    }

    // Create new category
    const newCategory = new categoryModel({ name, description });
    const savedCategory = await newCategory.save();

    const { __v, ...categoryInfo } = savedCategory.toObject();

    res.status(201).json({
      status: "success",
      message: "Category created successfully",
      result: categoryInfo,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
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
      return res.status(404).json({
        status: "fail",
        message: "Category not found",
      });
    }

    const { __v, ...categoryInfo } = updatedCategory.toObject();

    res.status(200).json({
      status: "success",
      message: "Category updated successfully",
      result: categoryInfo,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await categoryModel.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({
        status: "fail",
        message: "Category not found",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find({}, "-__v");

    res.status(200).json({
      status: "success",
      message: "Categories retrieved successfully",
      result: categories,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findById(id, "-__v");
    if (!category) {
      return res.status(404).json({
        status: "fail",
        message: "Category not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Category retrieved successfully",
      result: category,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

export {
  createCategory,
  updateCategory,
  deleteCategoryById,
  getAllCategories,
  getCategoryById,
};
