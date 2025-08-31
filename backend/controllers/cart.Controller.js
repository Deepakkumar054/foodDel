import userModel from "../models/userModel.js";

// ➕ Add item to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId } = req.body;

    const user = await userModel.findByIdAndUpdate(
      userId,
      { $inc: { [`cartData.${itemId}`]: 1 } }, // increment
      { new: true, upsert: true } // return updated doc
    );

    return res.json({
      success: true,
      message: "Item added to cart",
      cartData: user.cartData,
    });
  } catch (error) {
    console.log("❌ Error in addToCart:", error);
    return res.json({ success: false, message: "Something went wrong" });
  }
};

// ➖ Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId } = req.body;

    const user = await userModel.findOneAndUpdate(
      { _id: userId, [`cartData.${itemId}`]: { $gt: 0 } }, // only if > 0
      { $inc: { [`cartData.${itemId}`]: -1 } },
      { new: true }
    );

    if (!user) {
      return res.json({ success: false, message: "Item not in cart" });
    }

    // if it dropped to 0 → remove key
    if (user.cartData[itemId] <= 0) {
      await userModel.updateOne(
        { _id: userId },
        { $unset: { [`cartData.${itemId}`]: "" } }
      );
      delete user.cartData[itemId];
    }

    return res.json({
      success: true,
      message: "Item removed from cart",
      cartData: user.cartData,
    });
  } catch (error) {
    console.log("❌ Error in removeFromCart:", error);
    return res.json({ success: false, message: "Something went wrong" });
  }
};

// 📦 Get cart
export const getCart = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    return res.json({
      success: true,
      message: "User cart data fetched",
      cartData: user?.cartData || {},
    });
  } catch (error) {
    console.log("❌ Error in getCart:", error);
    return res.json({ success: false, message: "Something went wrong" });
  }
};
