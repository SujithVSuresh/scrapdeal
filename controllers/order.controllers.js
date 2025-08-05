import Order from '../models/Order.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

const placeOrder = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { productId, quantity } = req.body;

    // Fetch product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (quantity < product.minOrderQty && product.quantity > product.minOrderQty) {
      return res.status(400).json({ message: `Minimum order quantity is ${product.minOrderQty}` });
    }

    if (quantity > product.quantity) {
      return res.status(400).json({ message: `Only ${product.quantity} items available` });
    }

    const totalAmount = product.price * quantity;

    // Create order
    const order = await Order.create({
      product: new mongoose.Types.ObjectId(product._id),
      buyer: new mongoose.Types.ObjectId(buyerId),
      quantity,
      totalAmount,
    });

    // Update product quantity
    product.quantity -= quantity;
    if (product.quantity === 0) product.status = 'sold';
    await product.save();

    res.status(201).json({ message: "Order placed successfully", order });

  } catch (error) {
    res.status(500).json({ message: "Failed to place order", error: error.message });
  }
};


export const cancelOrder = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const orderId = req.params.id;

    console.log(buyerId, orderId, "this is the idddd123")

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.buyer.toString() !== buyerId) {
      return res.status(403).json({ message: 'Unauthorized: This is not your order' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    // Update order status
    order.status = 'cancelled';
    await order.save();

    // Restore product quantity
    const product = await Product.findById(order.product);
    if (product) {
      product.quantity += order.quantity;
      if (product.status === 'sold') {
        product.status = 'available';
      }
      await product.save();
    }

    res.status(200).json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel order', error: error.message });
  }
};

export const confirmOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const sellerId = req.user.id;

    const order = await Order.findById(orderId).populate('product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.product.seller.toString() !== sellerId) {
      return res.status(403).json({ message: 'Unauthorized: This is not your product order' });
    }

    if (order.status === 'confirmed') {
      return res.status(400).json({ message: 'Order already confirmed' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot confirm a cancelled order' });
    }

    order.status = 'confirmed';
    await order.save();

    res.status(200).json({ message: 'Order confirmed successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to confirm order', error: error.message });
  }
};

export const getOrdersByBuyer = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const orders = await Order.find({ buyer: buyerId })
      .populate('product')  // Populate product details
      .populate('buyer')    // Populate buyer details (optional)
      .sort({ orderDate: -1 }); // Latest orders first

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching buyer orders:", error);
    res.status(500).json({ error: "Failed to fetch buyer orders" });
  }
};



export const getProductOrders = async (req, res) => {
 try {
    const { productId } = req.params;
    const userId = req.user.id; // Assumed user ID from auth middleware

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Check if the product exists and belongs to the seller
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (product.seller.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized: You do not own this product' });
    }

    // Fetch orders for the product with populated product and buyer details
    const orders = await Order.find({ product: productId })
      .populate('product', 'name type image pickupLocation')
      .populate('buyer', 'name email phone')
      .lean();

    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching product orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export default {
    placeOrder,
    cancelOrder,
    confirmOrder,
    getOrdersByBuyer,
    getProductOrders
}