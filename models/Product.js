import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: Number,
  type: String,
  quantity: Number,
  minOrderQty: Number,
  image: String, 
  status: { type: String, enum: ['available', 'sold'], default: 'available' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pickupLocation: String
}, { timestamps: true });

export default mongoose.model('Product', productSchema, 'products');
