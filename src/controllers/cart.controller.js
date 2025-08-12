import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";

const createCart = async (req, res) => {
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

    res.status(201).json({
      status: "success",
      message: "Cart created successfully",
      result: cartInfo,
    });
  } catch (error) {
    console.error("Error creating cart:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getCart = async (req, res) => {
  try {
    const user = req.user.id;

    const existingCart = await cartModel
      .find({ user }, "-__v")
      .populate("cartItems.productId", "name -_id");

    res.status(200).json({
      status: "success",
      message: "Cart retrieved successfully",
      result: existingCart,
    });
  } catch (error) {
    console.error("Error getting cart:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    // Function declaration
    const { processedItems, totalAmount } = await cartCreation(payload);

    const cartId = await cartModel.findById(id);

    if (!cartId) {
      return res.status(404).json({
        status: "fail",
        message: "Cart not found",
      });
    }

    // Calling the function to add items and calc. price
    await cartCreation(payload, addedItems);

    const updatedCart = await cartModel.findByIdAndUpdate(
      id,
      { cartItems: processedItems, totalAmount },
      { new: true }
    );

    const { __v, ...cartInfo } = updatedCart.toObject();

    res.status(200).json({
      status: "success",
      message: "Cart updated successfully",
      result: cartInfo,
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const deleteCart = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user.id;

    if (user) {
      const deleteCart = await cartModel.findByIdAndDelete(id, "- __v");
      if (!deleteCart) {
        return res.status(404).json({
          status: "fail",
          message: "Product not found",
        });
      }
      return res.status(200).json({
        status: "success",
        message: "Cart deleted successfully",
      });
    }
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
      error: error.message,
    });
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
