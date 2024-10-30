import express, { Request, Response } from "express";
import UserModel, { IUser } from "../models/User";
import MemberModel, { IMember } from "../models/Members";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import loginRateLimiter from "../middlewares/Rate.Limit"; // Import rate limiter

const router = express.Router();

// Apply login rate limiter to the router
router.use(loginRateLimiter);

export class Auth {
  static async login(req: Request, res: Response) {
    const { phoneNumber, password } = req.body;
    let user: IUser | null = null;
    let member: IMember | null = null;

    try {
      // Validate input
      if (!phoneNumber || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide phone number and password",
        });
      }

      // Search for user or member by phone number
      user = await UserModel.findOne({ phoneNumber });
      member = await MemberModel.findOne({ phoneNumber });

      if (user) {
        // Validate user password
        if (!(await bcrypt.compare(password, user.password))) {
          return res.status(401).json({
            success: false,
            message: "Invalid credentials",
          });
        }

        // Generate JWT for user
        const token = jwt.sign(
          {
            _id: user._id,
            role: user.role,
            isDefaultPassword: user.isDefaultPassword,
          },
          process.env.JWT_SECRET as string,
          { expiresIn: "1d" }
        );

        return res
          .status(200)
          .json({ success: true, message: "User login successful", token });
      } else if (member) {
        // Validate member password
        if (!(await bcrypt.compare(password, member.password))) {
          return res.status(401).json({
            success: false,
            message: "Invalid credentials",
          });
        }

        // Generate JWT for member
        const token = jwt.sign(
          {
            _id: member._id,
            role: "member",
            isDefaultPassword: member.isDefaultPassword,
          },
          process.env.JWT_SECRET as string,
          { expiresIn: "1d" }
        );

        return res
          .status(200)
          .json({ success: true, message: "Member login successful", token });
      } else {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }
    } catch (error) {
      console.error("Error logging in:", error);
      return res
        .status(500)
        .json({ success: false, message: "Error logging in", error });
    }
  }
}

export default router;
