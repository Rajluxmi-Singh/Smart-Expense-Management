import User from "../models/UserSchema.js";
import bcrypt from "bcrypt";

// REGISTER CONTROLLER
export const registerControllers = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter all fields",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: userObj,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const loginControllers = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please enter all fields",
        });
      }
  
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Incorrect email or password",
        });
      }
  
      const { password: _, ...userWithoutPassword } = user.toObject(); // Exclude password
  
      return res.status(200).json({
        success: true,
        message: `Welcome back, ${user.name}`,
        user: userWithoutPassword,
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };
  

// OPTIONAL: GET ALL USERS (excluding current user)
export const allUsers = async (req, res, next) => {
  try {
    const user = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "name",
      "_id",
    ]);

    return res.json(user);
  } catch (err) {
    next(err);
  }
};
