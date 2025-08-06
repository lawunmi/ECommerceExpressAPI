import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const createUser = async (req, res) => {
  try {
    // Fields from request body
    const { email, password, ...others } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "fail", message: "Email and password are required" });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: "fail",
        message: "A user with this email already exists",
      });
    }

    // Password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new userModel({
      email,
      password: hashedPassword,
      ...others,
    });

    // Save user to database
    const savedUser = await newUser.save();

    // Exclude certain fields from response
    const { password: savedPassword, __v, ...userInfo } = savedUser.toObject();

    // Response payload
    res.status(201).json({
      status: "success",
      message: "User created successfully",
      result: userInfo,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Email and password are required",
      });
    }

    // Confirm if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Password validation
    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid password",
      });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, admin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Exclude certain fields from response
    const { password: savedPassword, _id, __v, ...userData } = user.toObject();

    // Response payload
    res
      .cookie("token", token, {
        maxAge: 2 * 60 * 60 * 1000,
        secure: true,
        httpOnly: true,
      })
      .set("Authorization", `Bearer ${token}`)
      .status(200)
      .json({
        status: "success",
        message: "Login successful",
        result: userData,
      });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    {
      const users = await userModel.find({}, "-password -__v");
      res.status(200).json({
        status: "success",
        message: "All users",
        result: users,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id, "-password -__v");
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }
    res.status(200).json({
      status: "success",
      message: "User found",
      result: user,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Save to database
    const updatedUser = await userModel.findByIdAndUpdate(userId, updates, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    // Exclude certain fields from response
    const { password, __v, ...userInfo } = updatedUser.toObject();

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      result: userInfo,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

export { createUser, loginUser, getAllUsers, getUserById, updateUser };
