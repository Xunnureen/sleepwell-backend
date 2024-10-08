import { Request, Response } from "express";
import UserModel, { IUser } from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Error } from "mongoose";

export class Auth {
  static async login(req: Request, res: Response) {
    const { phoneNumber, password } = req.body;
    let user: IUser | null = null;

    try {
      if ((!phoneNumber && !password) || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide email/phone number and password",
        });
      }

      user = await UserModel.findOne({ phoneNumber });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      //Todo...., to enable later !!!!
      const token = jwt.sign(
        { _id: user._id },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
      );

      const data = {
        ...user.toObject(),
        token,
      };

      return res
        .status(200)
        .json({ success: true, message: "Login successful", data });
    } catch (error) {
      console.error("Error logging in:", error); // Add detailed logging
      return res
        .status(500)
        .json({ success: false, message: "Error logging in", Error });
    }
  }
}
