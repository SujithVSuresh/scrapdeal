import mongoose from "mongoose";

const sellerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  phone: String,
  address: String,
});

export default mongoose.model("SellerProfile", sellerProfileSchema, "sellerprofiles");