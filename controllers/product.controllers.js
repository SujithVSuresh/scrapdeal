import Product from "../models/Product.js";
import User from "../models/User.js";
import SellerProfile from "../models/SellerProfile.js";
import mongoose from "mongoose";


const listProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      quantity,
      minOrderQty,
      type
    } = req.body;

    const sellerId = req.user.id;

    if (!name || !price || !quantity) {
      return res
        .status(400)
        .json({ message: "Missing required product fields" });
    }

    // Check if quantity is at least minOrderQty
    if (Number(quantity) < Number(minOrderQty)) {
      return res.status(400).json({
        message: "Available quantity cannot be less than minimum order quantity",
      });
    }

    // Check if user exists and is a seller
    const seller = await User.findById(sellerId);
    if (!seller || seller.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can list products" });
    }

    // Get seller's pickup location from seller profile
    const sellerProfile = await SellerProfile.findOne({ user: sellerId });
    if (!sellerProfile || !sellerProfile.address) {
      return res
        .status(400)
        .json({ message: "Seller profile or address not found" });
    }

    const pickupLocation = sellerProfile.address;

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const product = await Product.create({
      name,
      description,
      price,
      quantity,
      minOrderQty,
      image,
      type,
      seller: new mongoose.Types.ObjectId(sellerId),
      pickupLocation,
    });

    res.status(201).json({ message: "Product listed successfully", product });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to list product", error: error.message });
  }
};



export const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const products = await Product.find({
      seller: new mongoose.Types.ObjectId(sellerId),
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({ products });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const productId = new mongoose.Types.ObjectId(req.params.id);

    const result = await Product.aggregate([
      { $match: { _id: productId } },

      // Lookup from correct MongoDB collection name: "users"
      {
        $lookup: {
          from: "users", // ✅ lowercase plural
          localField: "seller",
          foreignField: "_id",
          as: "sellerInfo",
        },
      },
      { $unwind: "$sellerInfo" },

      // Lookup from correct collection name: "sellerprofiles"
      {
        $lookup: {
          from: "sellerprofiles", // ✅ lowercase plural
          localField: "seller",
          foreignField: "user",
          as: "sellerProfile",
        },
      },
      { $unwind: "$sellerProfile" },

      {
        $project: {
          name: 1,
          description: 1,
          price: 1,
          quantity: 1,
          minOrderQty: 1,
          status: 1,
          pickupLocation: 1,
          createdAt: 1,
          type: 1,
          image: 1,
          seller: {
            _id: "$sellerInfo._id",
            name: "$sellerInfo.name",
            email: "$sellerInfo.email",
          },
          sellerProfile: {
            address: "$sellerProfile.address",
            phone: "$sellerProfile.phone",
          },
        },
      },
    ]);

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product: result[0] });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch product", error: error.message });
  }
};

export const getAllAvailableProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: "available" })
      .populate({
        path: "seller",
        select: "name email",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch available products",
      error: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const sellerId = req.user.id;

    // Find product by ID
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the logged-in seller owns the product
    if (product.seller.toString() !== sellerId) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You cannot delete this product" });
    }

    // Delete product
    await Product.deleteOne({_id: new mongoose.Types.ObjectId(productId)})

    res.status(200).json({ message: "Product deleted successfully", productId });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete product", error: error.message });
  }
};

export default {
  listProduct,
  getSellerProducts,
  getProductById,
  getAllAvailableProducts,
  deleteProduct,
};
