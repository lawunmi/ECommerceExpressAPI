import productModel from "../models/product.model.js";
import categoryModel from "../models/category.model.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs/promises";

const createProduct = async (req, res) => {
  try {
    const { imageCount } = req.query;
    const expectedImageCount = parseInt(imageCount);
    const productImages = req.files;
    const { category, ...payload } = req.body;

    // Validate image count
    if (productImages.length < expectedImageCount) {
      return res.status(400).json({
        status: "fail",
        message: `Product images must be ${expectedImageCount} images`,
      });
    }

    // Validate required fields
    if (!payload.name || !payload.price || !payload.stock) {
      return res.status(400).json({
        status: "fail",
        message: "Provide values for all required fields",
      });
    }

    // Validate category
    const categoryExists = await categoryModel.findById(category);
    //console.log("Category exists:", categoryExists);
    if (!categoryExists) {
      return res.status(404).json({
        status: "fail",
        message: "Category not found",
      });
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

    res.status(201).json({
      status: "success",
      message: "Product created successfully",
      result: productInfo,
    });
  } catch (error) {
    //await fs.unlink(image.path); // delete file in case of error
    console.error("Error creating product:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await productModel
      .find({}, "-__v")
      .populate("category", "name");

    res.status(200).json({
      status: "success",
      result: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel
      .findById(id, "-__v")
      .populate("category", "name");

    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }

    res.status(200).json({
      status: "success",
      result: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
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
        return res.status(400).json({
          status: "fail",
          message: "Invalid price value",
        });
      }
      payload.price = parsedPrice;
    }

    if (stock !== undefined && stock !== "") {
      const parsedStock = parseInt(stock);
      if (isNaN(parsedStock) || parsedStock < 0) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid stock value",
        });
      }
      payload.stock = parsedStock;
    }

    if (category !== undefined && category.trim() !== "") {
      payload.category = category.trim();
    }

    const product = await productModel.findById(id);
    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }
    console.log("Product: ", product);
    console.log("Body payload: ", req.body);

    // Validate image count (only if files were uploaded)
    if (
      productImages &&
      productImages.length > 0 &&
      productImages.length < expectedImageCount
    ) {
      return res.status(400).json({
        status: "fail",
        message: `Product images must be ${expectedImageCount} images`,
      });
    }

    // Validate category only if provided
    let categoryExists;
    if (payload?.category) {
      categoryExists = await categoryModel.findById(payload.category);
      if (!categoryExists) {
        return res.status(404).json({
          status: "fail",
          message: "Category not found",
        });
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
    console.log("Payload: ", payload);

    const { __v, ...productInfo } = updatedProduct.toObject();

    res.status(200).json({
      status: "success",
      message: "Product updated successfully",
      result: productInfo,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await productModel.findByIdAndDelete(id);
    //console.log("Deleted Product: ", deletedProduct);
    if (!deletedProduct) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }
    res
      .status(200)
      .json({ status: "success", messages: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

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
