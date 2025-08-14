import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendSuccessResponse, sendErrorResponse } from "../utils/response.js";

const createUser = async (req, res, next) => {
  try {
    // Fields from request body
    const { email, password, ...others } = req.body;

    // Validate required fields
    if (!email || !password) {
      sendErrorResponse(res, 400, "Email and password are required");
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      sendErrorResponse(res, 409, "A user with this email already exists");
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

    sendSuccessResponse(res, 201, "User created successfully", userInfo);
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      sendErrorResponse(res, 400, "Email and password are required");
    }

    // Confirm if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      sendErrorResponse(res, 404, "User not found");
    }

    // Password validation
    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      sendErrorResponse(res, 401, "Invalid password");
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
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    {
      const users = await userModel.find({}, "-password -__v");
      sendSuccessResponse(res, 200, "All users", users);
    }
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id, "-password -__v");
    if (!user) {
      sendErrorResponse(res, 404, "User not found");
    }
    sendSuccessResponse(res, 200, "All users", user);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Save to database
    const updatedUser = await userModel.findByIdAndUpdate(userId, updates, {
      new: true,
    });

    if (!updatedUser) {
      sendErrorResponse(res, 404, "User not found");
    }

    // Exclude certain fields from response
    const { password, __v, ...userInfo } = updatedUser.toObject();

    sendSuccessResponse(res, 200, "User updated successfully", userInfo);
  } catch (error) {
    next(error);
  }
};

export { createUser, loginUser, getAllUsers, getUserById, updateUser };
