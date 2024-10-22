import { Request, Response } from "express";
import UserModel, { IUser } from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import MemberModel, { IMember } from "../models/Members";

export class Auth {
  static async login(req: Request, res: Response) {
    const { phoneNumber, password } = req.body;
    let user: IUser | null = null;
    let member: IMember | null = null;

    try {
      if (!phoneNumber || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide phone number and password",
        });
      }

      // Try to find the user by phoneNumber in both User and Member collections
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

        const token = jwt.sign(
          { _id: user._id, role: user.role },
          process.env.JWT_SECRET as string,
          { expiresIn: "1d" }
        );

        /*const data = {
          ...user.toObject(),
          token,
        };*/

        return res
          .status(200)
          .json({ success: true, message: "User login successful", token });
      } else if (member) {
        // Validate member password
        if (!(await member.comparePassword(password))) {
          return res.status(401).json({
            success: false,
            message: "Invalid credentials",
          });
        }

        const token = jwt.sign(
          { _id: member._id, role: "member" }, // Assuming role is 'member'
          process.env.JWT_SECRET as string,
          { expiresIn: "1d" }
        );

        /*const data = {
          ...member.toObject(),
          token,
        };*/

        return res
          .status(200)
          .json({ success: true, message: "Member login successful", token });
      } else {
        // If neither user nor member is found, return invalid credentials
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
