import { Request, Response } from "express";
import RepaymentModel from "../models/Repayment";
import LoanModel from "../models/Loan";
import UnitModel from "../models/Unit";

export class Repayment {
  static async create(req: Request, res: Response) {
    const { memberId, loanId, totalRepayment } = req.body;

    if (!loanId || !totalRepayment || !memberId) {
      return res.status(400).json({
        success: false,
        message: "Please provide required fields",
      });
    }

    try {
      // check if loanId exists
      const loan = await LoanModel.findById(loanId);
      if (!loan) {
        return res.status(404).json({
          success: false,
          message: "Loan not found",
        });
      }

      // check if memberId has units
      const unit = await UnitModel.findOne({ memberId });
      if (!unit) {
        return res.status(404).json({
          success: false,
          message: "Unit not found",
        });
      }

      // Calculate the new balance of the loan
      const remainingBalance = loan.amount - totalRepayment;
      if (remainingBalance < 0) {
        return res.status(400).json({
          success: false,
          message: "Repayment amount exceeds loan balance",
        });
      }

      // Update the loan balance and remaining total units
      loan.amount = remainingBalance;
      loan.remainingTotalUnits += totalRepayment; // Corrected from -= to += for repayment
      await loan.save();

      // Update the total units
      unit.totalUnit += totalRepayment;
      await unit.save();

      // Find existing repayment for the loan and member
      let repayment = await RepaymentModel.findOne({
        loanId,
        processedBy: memberId,
      });

      if (repayment) {
        // Update the existing repayment
        repayment.totalRepayement += totalRepayment;
        repayment.balance = remainingBalance;
        repayment.previousRemainingTotalUnits =
          repayment.currentRemainingTotalUnits;
        repayment.currentRemainingTotalUnits = loan.remainingTotalUnits;
        await repayment.save(); // Save updated repayment
        return res.status(200).json({
          success: true,
          message: "Repayment updated successfully",
          data: {
            repayment,
            remainingBalance,
            updatedTotalUnits: unit.totalUnit,
          },
        });
      } else {
        // Create a new repayment
        repayment = await RepaymentModel.create({
          loanId,
          totalRepayment,
          balance: remainingBalance,
          processedBy: memberId,
          previousRemainingTotalUnits:
            loan.remainingTotalUnits - totalRepayment,
          currentRemainingTotalUnits: loan.remainingTotalUnits,
        });
        return res.status(201).json({
          success: true,
          message: "Repayment created successfully",
          data: {
            repayment,
            remainingBalance,
            updatedTotalUnits: unit.totalUnit,
          },
        });
      }
    } catch (error: any) {
      console.error("Error creating or updating repayment:", error);
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

  // Update a specific repayment by ID
  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const { totalRepayment } = req.body;

    if (!totalRepayment) {
      return res.status(400).json({
        success: false,
        message: "Please provide the totalRepayment amount",
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

      // Assuming loanId and memberId are passed for updating purposes
      const { loanId, processedBy } = repayment;
      const loan = await LoanModel.findById(loanId);
      const unit = await UnitModel.findOne({ memberId: processedBy });

      if (!loan || !unit) {
        return res.status(404).json({
          success: false,
          message: "Loan or Unit not found",
        });
      }

      const remainingBalance = loan.amount - totalRepayment;
      if (remainingBalance < 0) {
        return res.status(400).json({
          success: false,
          message: "Repayment amount exceeds loan balance",
        });
      }

      // Update loan and unit
      loan.amount = remainingBalance;
      loan.remainingTotalUnits += totalRepayment;
      await loan.save();

      unit.totalUnit += totalRepayment;
      await unit.save();

      repayment.totalRepayement += totalRepayment;
      repayment.balance = remainingBalance;
      repayment.previousRemainingTotalUnits =
        repayment.currentRemainingTotalUnits;
      repayment.currentRemainingTotalUnits = loan.remainingTotalUnits;
      await repayment.save();

      return res.status(200).json({
        success: true,
        message: "Repayment updated successfully",
        data: {
          repayment,
          remainingBalance,
          updatedTotalUnits: unit.totalUnit,
        },
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
