import productModel from "../models/product.model.js";

// Function to add items to cart and calculate the amount
export const cartCreation = async (body) => {
  const processedItems = [];

  for (const item of body.cartItems) {
    const product = await productModel.findById(item.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const totalPrice = product.price * item.quantity;

    processedItems.push({
      productId: product._id,
      quantity: item.quantity,
      totalPrice,
    });
  }

  const totalAmount = calculateTotalAmount(processedItems);

  return { processedItems, totalAmount };
};

export const calculateTotalAmount = (items) => {
  return items.reduce((total, item) => total + item.totalPrice, 0);
};

export const mergeCartItems = (existingItems, newItems) => {
  const itemMap = new Map();

  // Add existing items to map
  existingItems.forEach((item) => {
    itemMap.set(item.productId.toString(), {
      productId: item.productId,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
    });
  });

  newItems.forEach((item) => {
    const productIdStr = item.productId.toString();
    if (itemMap.has(productIdStr)) {
      // Update existing item
      const existing = itemMap.get(productIdStr);
      existing.quantity += item.quantity;
      existing.totalPrice += item.totalPrice;
    } else {
      // Add new item
      itemMap.set(productIdStr, item);
    }
  });

  return Array.from(itemMap.values());
};
