import productModel from "../models/product.model.js";
import categoryModel from "../models/category.model.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs/promises";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response.js";

const createProduct = async (req, res, next) => {
  try {
    const { imageCount } = req.query;
    const expectedImageCount = parseInt(imageCount);
    const productImages = req.files;
    const { category, ...payload } = req.body;

    // Validate image count
    if (productImages.length < expectedImageCount) {
      return sendErrorResponse(
        res,
        400,
        `Product images must be ${expectedImageCount} images`
      );
    }

    // Validate required fields
    if (!payload.name || !payload.price || !payload.stock) {
      return sendErrorResponse(
        res,
        400,
        "Provide values for all required fields"
      );
    }

    // Validate category
    const categoryExists = await categoryModel.findById(category);
    //console.log("Category exists:", categoryExists);
    if (!categoryExists) {
      return sendErrorResponse(res, 404, "Category not found");
    }

    // Calling the logic to upload image
    const imageUrl = await imageUpload(req.files, categoryExists.name);
    //console.log("imageUrl: ", imageUrl);

    // Create product
    const newProduct = new productModel({
      category,
      productImages: imageUrl,
      ...payload,
    });

    const savedProduct = await newProduct.save();
    const { __v, ...productInfo } = savedProduct.toObject();

    return sendSuccessResponse(
      res,
      201,
      "Product created successfully",
      productInfo
    );
  } catch (error) {
    //await fs.unlink(image.path); // delete file in case of error
    next(error);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const products = await productModel
      .find({}, "-__v")
      .populate("category", "name");

    return sendSuccessResponse(
      res,
      200,
      "Products retrieved successfully",
      products
    );
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productModel
      .findById(id, "-__v")
      .populate("category", "name");

    if (!product) {
      return sendErrorResponse(res, 404, "Product not found");
    }

    return sendSuccessResponse(
      res,
      200,
      "Product retrieved successfully",
      product
    );
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imageCount } = req.query;
    const productImages = req.files;
    const { stock, ...productUpdate } = req.body;

    const expectedImageCount = parseInt(imageCount);

    const product = await productModel.findById(id);
    if (!product) {
      return sendErrorResponse(res, 404, "Product not found");
    }
    //console.log("Product: ", product);

    // Validate image count (only if files were uploaded)
    if (
      productImages &&
      productImages.length > 0 &&
      productImages.length < expectedImageCount
    ) {
      return sendErrorResponse(
        res,
        400,
        `Product images must be ${expectedImageCount} images`
      );
    }

    // Validate category only if provided
    let categoryExists;
    if (productUpdate.category) {
      categoryExists = await categoryModel.findById(productUpdate.category);
      if (!categoryExists) {
        return sendSuccessResponse(res, 404, "Category not found");
      }
    }

    let newStock = product.stock;
    if (stock) {
      newStock = product.stock + parseInt(stock);
    }

    // Upload images if any
    let imageUrl = product.productImages; // Keep old images if none provided
    if (productImages && productImages.length > 0) {
      imageUrl = await imageUpload(
        req.files,
        categoryExists?.name || product.category.name
      );
    }

    // Update product
    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      {
        stock: newStock,
        ...productUpdate,
        productImages: imageUrl,
      },
      { new: true, runValidators: true }
    );

    const { __v, ...productInfo } = updatedProduct.toObject();

    return sendSuccessResponse(
      res,
      200,
      "Product updated successfully",
      productInfo
    );
  } catch (error) {
    next(error);
  }
};

const deleteProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedProduct = await productModel.findByIdAndDelete(id);
    if (!deletedProduct) {
      return sendErrorResponse(res, 404, "Product not found");
    }
    return sendSuccessResponse(res, 200, "Product deleted successfully");
  } catch (error) {
    next(error);
  }
};

// Function for image upload
const imageUpload = async (file, name) => {
  const image = file;
  const uploadedImages = [];
  for (const img of image) {
    const response = await cloudinary.uploader.upload(img.path, {
      folder: `${name}`,
    });
    uploadedImages.push(response.secure_url);
    await fs.unlink(img.path);
    //console.log("uploadedImages: ", uploadedImages);
  }
  return uploadedImages;
};

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProductById,
};
