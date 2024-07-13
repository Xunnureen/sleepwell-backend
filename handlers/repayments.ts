import { Request, Response } from "express";
import RepaymentModel from "../models/Repayment";
import LoanModel from "../models/Loan";
import UserModel from "../models/User";
import UnitModel from "../models/Unit";

export class Repayment {
  static async create(req: Request, res: Response) {
    const { memberId, loanId, repaymentAmount } = req.body;

    if (!loanId || !repaymentAmount || !memberId) {
      return res.status(400).json({
        success: false,
        message: "Please provide required fields",
      });
    }

    try {
      // Validate if loanId exists
      const loan = await LoanModel.findById(loanId);
      if (!loan) {
        return res.status(404).json({
          success: false,
          message: "Loan not found",
        });
      }

      // Validate if memberId has units
      const unit = await UnitModel.findOne({ memberId });
      if (!unit) {
        return res.status(404).json({
          success: false,
          message: "Unit not found",
        });
      }

      // Calculate the new balance of the loan
      const remainingBalance = loan.amount - repaymentAmount;
      if (remainingBalance < 0) {
        return res.status(400).json({
          success: false,
          message: "Repayment amount exceeds loan balance",
        });
      }

      // Record the remainingTotalUnits before repayment
      const previousRemainingTotalUnits = loan.remainingTotalUnits;

      // Update the loan balance and remaining total units
      loan.remainingTotalUnits += repaymentAmount; // Corrected from -= to += for repayment
      await loan.save();

      // Update the total units
      unit.totalUnit += repaymentAmount;
      await unit.save();

      // Create the repayment
      const newRepayment = await RepaymentModel.create({
        loanId,
        repaymentAmount,
        balance: remainingBalance,
        processedBy: memberId,
        previousRemainingTotalUnits,
        currentRemainingTotalUnits: loan.remainingTotalUnits, // Record current remaining total units
      });

      return res.status(201).json({
        success: true,
        message: "Repayment of loan has been made successfully",
        data: {
          newRepayment,
          remainingBalance,
          updatedTotalUnits: unit.totalUnit,
        },
      });
    } catch (error: any) {
      console.error("Error creating repayment:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // get single repayment by Id
  static async getById(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const repayment = await RepaymentModel.findById(id);
      if (!repayment) {
        return res.status(404).json({
          success: false,
          message: "Repayment not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: repayment,
      });
    } catch (error: any) {
      console.error("Error fetching repayment:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // get all repayment
  static async getAll(req: Request, res: Response) {
    try {
      const repayments = await RepaymentModel.find();
      return res.status(200).json({
        success: true,
        data: repayments,
      });
    } catch (error: any) {
      console.error("Error fetching repayments:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // update repayment
  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const { repaymentAmount } = req.body;

    if (!repaymentAmount) {
      return res.status(400).json({
        success: false,
        message: "Please provide repayment amount",
      });
    }

    try {
      const repayment = await RepaymentModel.findById(id);
      if (!repayment) {
        return res.status(404).json({
          success: false,
          message: "Repayment not found",
        });
      }

      const loan = await LoanModel.findById(repayment.loanId);
      if (!loan) {
        return res.status(404).json({
          success: false,
          message: "Associated loan not found",
        });
      }

      // Record the previous remaining total units in the loan document
      const previousRemainingTotalUnits = loan.remainingTotalUnits;

      // Calculate the new balance
      const newBalance =
        loan.amount + repayment.repaymentAmount - repaymentAmount;
      if (newBalance < 0) {
        return res.status(400).json({
          success: false,
          message: "New repayment amount exceeds loan balance",
        });
      }

      // Update the repayment amount and balance
      repayment.repaymentAmount = repaymentAmount;
      repayment.balance = newBalance;
      await repayment.save();

      // Update the loan document with new remaining total units
      loan.remainingTotalUnits = repayment.currentRemainingTotalUnits;
      await loan.save();

      return res.status(200).json({
        success: true,
        message: "Repayment updated successfully",
        data: repayment,
      });
    } catch (error: any) {
      console.error("Error updating repayment:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete the repayment record
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleteReypayment = await RepaymentModel.findByIdAndDelete(id);

      if (!deleteReypayment) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      return res.status(200).json({
        success: true,
        message: "Repayment deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting repayment:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
