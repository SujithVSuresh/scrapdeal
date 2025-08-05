import User from "../models/User.js";
import SellerProfile from "../models/SellerProfile.js";
import BuyerProfile from "../models/BuyerProfile.js";
import generateToken from "../utils/generateToken.js";

// @route   POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password, role, address, phone, businessName } = req.body;

    if (!name || !email || !password || !role || !address || !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (role === "buyer" && !businessName) {
      return res.status(400).json({ message: "Business name is required for buyer" });
    }

    if (!["buyer", "seller"].includes(role)) {
      return res.status(400).json({ message: "Role must be either 'buyer' or 'seller'" });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const newUser = new User({ name, email, password, role });
    await newUser.save();

    // Create corresponding profile
    if (role === "seller") {
      await SellerProfile.create({
        user: newUser._id,
        address,
        phone,
      });
    } else if (role === "buyer") {
      await BuyerProfile.create({
        user: newUser._id,
        address,
        phone,
        businessName,
      });
    }

    // Generate token
    const token = generateToken(newUser);

    // Send response
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error during signup", error: err.message });
  }
};


// @route   POST /api/auth/signin
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = generateToken(user);
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error during signin", error: err.message });
  }
};

export default {
  signin,
  signup,
};
