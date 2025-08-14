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
      sendErrorResponse(
        res,
        400,
        `Product images must be ${expectedImageCount} images`
      );
    }

    // Validate required fields
    if (!payload.name || !payload.price || !payload.stock) {
      sendErrorResponse(res, 400, "Provide values for all required fields");
    }

    // Validate category
    const categoryExists = await categoryModel.findById(category);
    //console.log("Category exists:", categoryExists);
    if (!categoryExists) {
      sendErrorResponse(res, 404, "Category not found");
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

    sendSuccessResponse(res, 201, "Product created successfully", productInfo);
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

    sendSuccessResponse(res, 200, "Products retrieved successfully", products);
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
      sendErrorResponse(res, 404, "Product not found");
    }

    sendSuccessResponse(res, 200, "Product retrieved successfully", product);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { imageCount } = req.query;
    const productImages = req.files;
    const { name, description, price, stock, category } = req.body;

    const expectedImageCount = parseInt(imageCount);

    const payload = {};

    if (name !== undefined && name.trim() !== "") {
      payload.name = name.trim();
    }

    if (description !== undefined && description.trim() !== "") {
      payload.description = description.trim();
    }

    if (price !== undefined && price !== "") {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        sendErrorResponse(res, 400, "Invalid price");
      }
      payload.price = parsedPrice;
    }

    if (stock !== undefined && stock !== "") {
      const parsedStock = parseInt(stock);
      if (isNaN(parsedStock) || parsedStock < 0) {
        sendErrorResponse(res, 400, "Invalid value");
      }
      payload.stock = parsedStock;
    }

    if (category !== undefined && category.trim() !== "") {
      payload.category = category.trim();
    }

    const product = await productModel.findById(id);
    if (!product) {
      sendErrorResponse(res, 404, "Product not found");
    }
    //console.log("Product: ", product);
    //console.log("Body payload: ", req.body);

    // Validate image count (only if files were uploaded)
    if (
      productImages &&
      productImages.length > 0 &&
      productImages.length < expectedImageCount
    ) {
      sendErrorResponse(
        res,
        400,
        `Product images must be ${expectedImageCount} images`
      );
    }

    // Validate category only if provided
    let categoryExists;
    if (payload?.category) {
      categoryExists = await categoryModel.findById(payload.category);
      if (!categoryExists) {
        sendSuccessResponse(res, 404, "Category not found");
      }
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
        ...payload,
        productImages: imageUrl,
      },
      { new: true }
    );
    //console.log("Payload: ", payload);

    const { __v, ...productInfo } = updatedProduct.toObject();

    sendSuccessResponse(res, 200, "Product updated successfully", productInfo);
  } catch (error) {
    next(error);
  }
};

const deleteProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedProduct = await productModel.findByIdAndDelete(id);
    //console.log("Deleted Product: ", deletedProduct);
    if (!deletedProduct) {
      sendErrorResponse(res, 404, "Product not found");
    }
    sendSuccessResponse(res, 200, "Product deleted successfully");
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
