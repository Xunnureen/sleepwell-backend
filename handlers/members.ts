import { Request, Response } from "express";
import MemberModel, { IMember } from "../models/Members";
import { UserService } from "../services/user.service";
import bcrypt from "bcrypt";

// Member class
export class Member {
  // Create a new member
  static async create(req: Request, res: Response) {
    const {
      userId,
      memberName,
      phoneNumber,
      email,
      sp_sj_no,
      ippsNo,
      role,
      registrationDate,
      status,
    } = req.body;

    if (!userId || !memberName || !phoneNumber || !sp_sj_no || !ippsNo) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    try {
      // Check if a member with the same phone number already exists
      const existingMember = await MemberModel.findOne({ phoneNumber });

      if (existingMember) {
        return res.status(400).json({
          success: false,
          message: "Member with this phone number already exists",
        });
      }

      const memberData = {
        memberName,
        phoneNumber,
        email,
        sp_sj_no,
        ippsNo,
        password: phoneNumber, // Default password is the phone number
        role,
        createdBy: userId,
      };

      // Create an account for member
      const accountCreationResponse = await UserService.createMemberAccount(
        userId,
        memberName,
        phoneNumber,
        email
      );

      if (!accountCreationResponse.success) {
        return res.status(500).json({
          success: false,
          message: "Member account creation failed",
          error: accountCreationResponse.message,
        });
      }

      const length = await MemberModel.countDocuments();
      const newMember: IMember = await MemberModel.create(memberData);

      return res.status(201).json({
        success: true,
        message: "Member created successfully",
        length,
        data: newMember,
      });
    } catch (error) {
      console.error("Error creating member: ", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get a single member by ID
  static async singleMember(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const singleMember = await MemberModel.findById(id).populate(
        "createdBy",
        "fullName"
      );

      if (!singleMember) {
        return res
          .status(404)
          .json({ success: false, message: "Member not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Single member data fetched successfully",
        data: singleMember,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Error retrieving single member",
        error: error.message,
      });
    }
  }

  // Get all members
  static async getAllMembers(req: Request, res: Response) {
    try {
      const allMembers = await MemberModel.find({}).populate(
        "createdBy",
        "fullName"
      );
      const length = await MemberModel.countDocuments();

      if (allMembers.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No members exist" });
      }

      return res.status(200).json({
        success: true,
        message: "Members list fetched successfully",
        numberOfMembers: length,
        data: allMembers,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Error retrieving members",
        error: error.message,
      });
    }
  }

  // Update a member
  static async updateMember(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updatedMember = await MemberModel.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!updatedMember) {
        return res
          .status(404)
          .json({ success: false, message: "Member not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Member updated successfully",
        data: updatedMember,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Error updating member",
        error: error.message,
      });
    }
  }

  // Delete a member by ID
  static async deleteMember(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deletedMember = await MemberModel.findByIdAndDelete(id);

      if (!deletedMember) {
        return res
          .status(404)
          .json({ success: false, message: "Member not found" });
      }

      return res
        .status(200)
        .json({ success: true, message: "Member deleted successfully" });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Error deleting member",
        error: error.message,
      });
    }
  }
}

export default Member;
