import mongoose from "mongoose";

const buyerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  businessName: String,
  phone: String,
  address: String,
});

export default mongoose.model("BuyerProfile", buyerProfileSchema, "buyerprofiles");