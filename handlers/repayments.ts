import { Request, Response } from "express";
import RepaymentModel from "../models/Repayment";
import LoanModel from "../models/Loan";
import UnitModel from "../models/Unit";
import RepaymentHistory from "../models/Recent.Repayment";
import { Action } from "../utils/types";

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
      // Check if loanId exists
      const loan = await LoanModel.findById(loanId);
      if (!loan) {
        return res.status(404).json({
          success: false,
          message: "Loan not found",
        });
      }

      // Check if memberId has units
      const unit = await UnitModel.findOne({ memberId });
      if (!unit) {
        return res.status(404).json({
          success: false,
          message: "Unit not found",
        });
      }

      // Parse repaymentAmount to ensure it's treated as a number
      const repaymentAmt = parseInt(repaymentAmount);
      if (isNaN(repaymentAmt)) {
        return res.status(400).json({
          success: false,
          message: "Invalid repayment amount",
        });
      }

      // Calculate the new balance of the loan
      const newRemainingBalance = loan.loanTaken - repaymentAmt;
      if (newRemainingBalance < 0) {
        return res.status(400).json({
          success: false,
          message: "Repayment amount exceeds loan balance",
        });
      }

      // Update the loan balance and remaining total units
      loan.loanTaken = newRemainingBalance;
      loan.remainingTotalUnits += repaymentAmt;
      await loan.save();

      // Update the total units
      unit.totalUnit += repaymentAmt;
      await unit.save();

      // Find existing repayment for the loan and member
      let repayment = await RepaymentModel.findOne({
        loanId,
        processedBy: memberId,
      });

      if (repayment) {
        // Check if the loan balance is zero
        if (newRemainingBalance === 0) {
          // Reset repaymentAmount to zero if the loan balance is zero
          repayment.repaymentAmount = 0;
          repayment.balance = 0;
        } else {
          // Update the existing repayment
          repayment.repaymentAmount += repaymentAmt;
          repayment.balance = newRemainingBalance;
          repayment.previousRemainingTotalUnits =
            repayment.currentRemainingTotalUnits;
        }
        repayment.currentRemainingTotalUnits = unit.totalUnit; // Ensure currentRemainingTotalUnits reflects unit.totalUnit
        repayment.totalRepayment += repaymentAmt; // Increment totalRepayment
        await repayment.save(); // Save updated repayment

        // Record the repayment update in history
        await RepaymentHistory.create({
          loanId,
          action: Action.UPDATED,
          memberId,
          repaymentAmount: repayment.repaymentAmount,
          balance: repayment.balance,
          processedBy: memberId,
          previousRemainingTotalUnits: repayment.previousRemainingTotalUnits,
          currentRemainingTotalUnits: repayment.currentRemainingTotalUnits,
          totalRepayment: repayment.totalRepayment,
        });

        return res.status(200).json({
          success: true,
          message: "Repayment updated successfully",
          data: {
            repayment,
            remainingBalance: repayment.balance,
            updatedTotalUnits: unit.totalUnit,
            processedBy: memberId,
          },
        });
      } else {
        // Create a new repayment
        repayment = await RepaymentModel.create({
          loanId,
          memberId, // Ensure memberId is set
          repaymentAmount: newRemainingBalance === 0 ? 0 : repaymentAmt, // Reset repaymentAmount for new loan
          balance: newRemainingBalance === 0 ? 0 : newRemainingBalance, // Ensure balance is set to 0 if fully repaid
          processedBy: memberId,
          previousRemainingTotalUnits: unit.totalUnit - repaymentAmt,
          currentRemainingTotalUnits: unit.totalUnit, // Ensure currentRemainingTotalUnits reflects unit.totalUnit
          totalRepayment: repaymentAmt, // Initialize totalRepayment
        });

        // Record the repayment creation in history
        await RepaymentHistory.create({
          loanId,
          action: Action.CREATED,
          memberId,
          repaymentAmount: repayment.repaymentAmount,
          balance: repayment.balance,
          processedBy: memberId,
          previousRemainingTotalUnits: repayment.previousRemainingTotalUnits,
          currentRemainingTotalUnits: repayment.currentRemainingTotalUnits,
          totalRepayment: repayment.totalRepayment,
        });

        return res.status(201).json({
          success: true,
          message: "Repayment created successfully",
          data: {
            repayment,
            remainingBalance: repayment.balance,
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
      const repayment = await RepaymentModel.findById(id).populate("memberId");
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

  // get all repayments
  static async getAll(req: Request, res: Response) {
    try {
      const repayments = await RepaymentModel.find().populate("memberId");
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
    const { repaymentAmount } = req.body;

    if (!repaymentAmount) {
      return res.status(400).json({
        success: false,
        message: "Please provide the repayment amount",
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

      const remainingBalance = loan.loanTaken - repaymentAmount;
      if (remainingBalance < 0) {
        return res.status(400).json({
          success: false,
          message: "Repayment amount exceeds loan balance",
        });
      }

      // Update loan and units
      loan.loanTaken = remainingBalance;
      loan.remainingTotalUnits += repaymentAmount;
      await loan.save();

      unit.totalUnit += repaymentAmount;
      await unit.save();

      repayment.repaymentAmount += repaymentAmount;
      repayment.balance = remainingBalance;
      repayment.previousRemainingTotalUnits =
        repayment.currentRemainingTotalUnits;
      repayment.currentRemainingTotalUnits = loan.remainingTotalUnits;
      repayment.totalRepayment += repaymentAmount; // Increment totalRepayment
      await repayment.save();

      // Record the repayment update in history
      await RepaymentHistory.create({
        loanId,
        action: Action.UPDATED,
        memberId: processedBy,
        repaymentAmount: repayment.repaymentAmount,
        balance: repayment.balance,
        processedBy,
        previousRemainingTotalUnits: repayment.previousRemainingTotalUnits,
        currentRemainingTotalUnits: repayment.currentRemainingTotalUnits,
        totalRepayment: repayment.totalRepayment,
      });

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

  // New recentLoans method to fetch loans history
  static async recentRepayments(req: Request, res: Response) {
    try {
      const recentRepayment = await RepaymentHistory.find()
        .populate("memberId")
        .populate("processedBy")
        .sort({
          createdAt: -1,
        }); //to be populate with memberId .populate("memberId")

      return res.status(200).json({
        success: true,
        message: "Recent Repayments actions fetched successfully",
        data: recentRepayment,
      });
    } catch (error: any) {
      console.error("Error fetching recent repayments:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
