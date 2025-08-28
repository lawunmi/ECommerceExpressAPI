import cartModel from "../models/cart.model.js";
import { sendSuccessResponse, sendErrorResponse } from "../utils/response.js";
import {
  calculateTotalAmount,
  cartCreation,
  mergeCartItems,
} from "../utils/cartHelper.js";

const addToCart = async (req, res, next) => {
  try {
    const payload = req.body;

    // Function declaration
    const { processedItems, totalAmount } = await cartCreation(payload);

    // Calling the function to add items and calculate price
    await cartCreation(payload, addedItems);

    const newCart = new cartModel({
      user: req.user.id,
      cartItems: processedItems,
      totalAmount,
    });

    const savedCart = await newCart.save();

    const { __v, user, ...cartInfo } = savedCart.toObject();

    return sendSuccessResponse(res, 201, "Cart created successfully", cartInfo);
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

    if (existingCart.length === 0) {
      return sendSuccessResponse(res, 200, "Your cart is currently empty", {});
    }
    return sendSuccessResponse(
      res,
      200,
      "Cart retrieved successfully",
      existingCart
    );
  } catch (error) {
    next(error);
  }
};

const addToExistingCart = async (req, res, next) => {
  try {
    const { cartId } = req.params;
    const payload = req.body;

    // Existing cart
    const existingCart = await cartModel.findById(cartId);
    if (!existingCart) {
      return sendErrorResponse(res, 404, "Cart not found");
    }

    //  New items
    const { processedItems: newItems } = await cartCreation(payload);

    // Merge with existing items
    const mergedItems = mergeCartItems(existingCart.cartItems, newItems);

    // Calculate total amount for all items
    const totalAmount = calculateTotalAmount(mergedItems);

    const updatedCart = await cartModel.findByIdAndUpdate(
      cartId,
      { cartItems: mergedItems, totalAmount },
      { new: true }
    );

    const { __v, ...cartInfo } = updatedCart.toObject();

    return sendSuccessResponse(res, 200, "Cart updated successfully", cartInfo);
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { cartId, productId } = req.params;

    // Find the cart
    const cart = await cartModel.findById(cartId);
    if (!cart) {
      return sendErrorResponse(res, 404, "Cart not found");
    }

    // Check if item exists in cart
    const itemIndex = cart.cartItems.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return sendErrorResponse(res, 404, "Item not found in cart");
    }

    // Remove the item from cart
    cart.cartItems.splice(itemIndex, 1);

    // Recalculate total amount
    const totalAmount = calculateTotalAmount(cart.cartItems);

    // Update cart
    const updatedCart = await cartModel.findByIdAndUpdate(
      cartId,
      { cartItems: cart.cartItems, totalAmount },
      { new: true }
    );

    const { __v, ...cartInfo } = updatedCart.toObject();
    sendSuccessResponse(
      res,
      200,
      "Item removed from cart successfully",
      cartInfo
    );
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const { cartId } = req.params;
    const user = req.user.id;

    if (user) {
      const updatedCart = await cartModel.findByIdAndUpdate(
        cartId,
        {
          cartItems: [],
          totalAmount: 0,
        },
        { new: true }
      );

      if (!updatedCart) {
        return sendErrorResponse(res, 404, "Cart not found");
      }

      const { __v, ...cartInfo } = updatedCart.toObject();
      return sendSuccessResponse(
        res,
        200,
        "Cart cleared successfully",
        cartInfo
      );
    }
  } catch (error) {
    next(error);
  }
};

export { addToCart, getCart, addToExistingCart, removeFromCart, clearCart };
