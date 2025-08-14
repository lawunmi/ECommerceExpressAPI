import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import { sendSuccessResponse, sendErrorResponse } from "../utils/response.js";

const createCart = async (req, res, next) => {
  try {
    const payload = req.body;

    // Function declaration
    const { processedItems, totalAmount } = await cartCreation(payload);

    // Calling the function to add items and calc. price
    await cartCreation(payload, addedItems);

    const newCart = new cartModel({
      user: req.user.id,
      cartItems: processedItems,
      totalAmount,
    });

    const savedCart = await newCart.save();

    const { __v, user, ...cartInfo } = savedCart.toObject();

    sendSuccessResponse(res, 201, "Cart created successfully", cartInfo);
  } catch (error) {
    next(error);
  }
};

const getCart = async (req, res, next) => {
  try {
    const user = req.user.id;

    const existingCart = await cartModel
      .find({ user }, "-__v")
      .populate("cartItems.productId", "name -_id");

    sendSuccessResponse(res, 200, "Cart retrieved successfully", existingCart);
  } catch (error) {
    next(error);
  }
};

const updateCart = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    // Function declaration
    const { processedItems, totalAmount } = await cartCreation(payload);

    const cartId = await cartModel.findById(id);

    if (!cartId) {
      sendErrorResponse(res, 404, "Cart not found");
    }

    // Calling the function to add items and calc. price
    await cartCreation(payload, addedItems);

    const updatedCart = await cartModel.findByIdAndUpdate(
      id,
      { cartItems: processedItems, totalAmount },
      { new: true }
    );

    const { __v, ...cartInfo } = updatedCart.toObject();

    sendSuccessResponse(res, 200, "Cart updated successfully", cartInfo);
  } catch (error) {
    next(error);
  }
};

const deleteCart = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user.id;

    if (user) {
      const deleteCart = await cartModel.findByIdAndDelete(id, "- __v");
      if (!deleteCart) {
        sendErrorResponse(res, 404, "Product not found");
      }
      sendSuccessResponse(res, 200, "cart deleted successfully");
    }
  } catch (error) {
    next(error);
  }
};

// Function to add items to cart and calculate the amount
const cartCreation = async (body) => {
  let totalAmount = 0;
  const processedItems = [];

  for (const item of body.cartItems) {
    const product = await productModel.findById(item.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const totalPrice = product.price * item.quantity;
    totalAmount += totalPrice;

    processedItems.push({
      productId: product._id,
      quantity: item.quantity,
      totalPrice,
    });
  }

  return { processedItems, totalAmount };
};

export { createCart, getCart, updateCart, deleteCart };
