import { Request, Response } from "express";
import UserModel, { IUser } from "../models/User";
import MemberModel from "../models/Members";
import { RoleName } from "../utils/types";
import bcrypt from "bcrypt";

//User
export class User {
  // Add/create new user
  static async create(req: Request, res: Response) {
    const { userId, fullName, phoneNumber, email, role } = req.body;

    if (!userId || !fullName || !phoneNumber || !role) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    try {
      // Check if username or email already exists in the database
      const existingUser = await UserModel.findOne({ phoneNumber });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Account with this phone number already exists",
        });
      }

      const userData = {
        fullName,
        phoneNumber,
        email,
        password: phoneNumber,
        role,
        createdBy: userId,
      };

      const Length = await UserModel.countDocuments();
      const newUser: IUser = await UserModel.create(userData);

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        length: Length,
        data: newUser,
      });
    } catch (error) {
      console.error("Error creating user: ", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get single user by Id
  static async singleUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const singleUser = await UserModel.findById(id).populate(
        "createdBy",
        "fullName"
      );

      if (!singleUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Single user data fetched successfully",
        data: singleUser,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Error retrieving single user",
        error: error.message,
      });
    }
  }

  // Get all users
  static async getAllUsers(req: Request, res: Response) {
    try {
      const allUsers = await UserModel.find({}).populate(
        "createdBy",
        "fullName"
      );
      const Length = await UserModel.countDocuments();

      if (allUsers.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No users exist" });
      }

      return res.status(200).json({
        success: true,
        message: "Users list fetched successfully",
        numberOfUsers: Length,
        data: allUsers,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Error retrieving users",
        error: error.message,
      });
    }
  }

  // Update user
  static async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { fullName, email } = req.body;

      const updatedUser = await UserModel.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!updatedUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Error updating user",
        error: error.message,
      });
    }
  }

  // Update default password
  static async updateDefaultPassword(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { password, newPassword } = req.body;

      const user: IUser | null = await UserModel.findById(id);

      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // Check if user has already updated password
      if (!user.isDefaultPassword) {
        return res.status(400).json({
          success: false,
          message: "Password has already been updated",
        });
      }

      // Verify the current password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Current password is incorrect" });
      }
      console.log({ newPassword });
      if (password === newPassword) {
        return res.status(400).json({
          success: false,
          message: "New password cannot be the same as the old password",
        });
      }

      if (newPassword === user.phoneNumber) {
        return res.status(400).json({
          success: false,
          message:
            "Oops! Your new password cannot be the same as your phone number. Please choose a different password.",
        });
      }

      // const saltRounds = 10;
      // const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      user.password = newPassword;
      user.isDefaultPassword = false;

      const updatedUser = await user.save();

      return res.status(200).json({
        success: true,
        message: "Password updated successfully",
        data: updatedUser,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Error updating user password",
        error: error.message,
      });
    }
  }

  // Delete user by ID
  static async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deletedUser = await UserModel.findByIdAndDelete(id);

      if (!deletedUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      return res
        .status(200)
        .json({ success: true, message: "User deleted successfully" });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Error deleting user",
        error: error.message,
      });
    }
  }

  // Logout
  static async logout(req: Request, res: Response) {
    try {
      // Clear the token cookie
      res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0), // Expire the cookie immediately
        sameSite: "none",
        secure: true,
      });

      return res.status(200).json({ message: "Successfully logged out" });
    } catch (error: any) {
      console.error("Error logging out:", error); // Add detailed logging
      return res
        .status(500)
        .json({ success: false, message: "Error logging out", error });
    }
  }

  /// Reset Password - Only Admin can reset a Member's password
  static async forgotPassword(req: Request, res: Response) {
    try {
      const { userId, memberId } = req.body;

      // Ensure required fields are provided
      if (!userId || !memberId) {
        return res.status(400).json({
          success: false,
          message: "Please provide both userId and memberId",
        });
      }

      // Check if the requesting user is an Admin
      const adminUser = await UserModel.findById(userId);
      if (!adminUser || adminUser.role !== RoleName.ADMIN) {
        return res.status(403).json({
          success: false,
          message: "Only Admins are authorized to reset passwords",
        });
      }

      // Check if the Member exists
      const member = await MemberModel.findById(memberId);
      if (!member) {
        return res.status(404).json({
          success: false,
          message: "Member not found",
        });
      }

      if (member.isDefaultPassword) {
        return res.status(200).json({
          success: false,
          message: "Password is already reset thank you!!.",
        });
      }

      // Set the new password to the Member's phone number
      const newPassword = member.phoneNumber;

      //hashed the phoneNumber
      const saltRounds = 10;
      member.password = await bcrypt.hash(newPassword, saltRounds);

      // Update the member's password and set isDefaultPassword to true
      member.password = newPassword;
      member.isDefaultPassword = true;

      const reset = await member.save(); // Ensure the member is saved after updating

      return res.status(200).json({
        success: true,
        message: "Member's password has been reset to their phone number",
        data: reset,
      });
    } catch (error: any) {
      console.error("Error in forgot password: ", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
}
