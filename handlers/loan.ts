import { Request, Response } from "express";
import LoanModel from "../models/Loan";
import UnitModel from "../models/Unit";
import LoanHistory from "../models/Recent.Loan";
import { Action } from "../utils/types";

const MIN_TOTAL_UNIT = 2500; // Define the minimum total units required

export class Loan {
  static async create(req: Request, res: Response) {
    const { userId, memberId, unitId, amount } = req.body;

    if (!userId || !memberId || !unitId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Please provide required fields",
      });
    }

    try {
      // Validate if unitId exists
      const unit = await UnitModel.findById(unitId);
      if (!unit) {
        return res.status(404).json({
          success: false,
          message: "Unit not found",
        });
      }

      const loanAmount = parseInt(amount);
      if (isNaN(loanAmount)) {
        return res.status(400).json({
          success: false,
          message: "Invalid loan amount",
        });
      }

      // Check if the loan amount is greater than the total units
      if (loanAmount > unit.totalUnit) {
        return res.status(400).json({
          success: false,
          message: `Loan amount cannot be greater than total units`,
        });
      }

      // Check if the total units meet the required threshold
      if (unit.totalUnit < MIN_TOTAL_UNIT) {
        return res.status(400).json({
          success: false,
          message: `Total units must be at least ${MIN_TOTAL_UNIT} to create a loan`,
        });
      }

      // Find existing loan for the unit and member
      let loan = await LoanModel.findOne({ unitId, memberId });
      let status = {};

      if (loan) {
        // Update the existing loan without incrementing the amount
        loan.amount = loanAmount; // Set the loan amount to the new amount
        loan.loanTaken += loanAmount; // Increment loanTaken by the new loan amount
        loan.remainingTotalUnits = unit.totalUnit - loan.amount;
        loan.totalLoan += loanAmount; // Increment totalLoan by the new loan amount

        // Log the update in LoanHistory
        await LoanHistory.create({
          memberId,
          action: Action.UPDATED,
          amount: loanAmount,
          loanTaken: loan.loanTaken,
          totalLoan: loan.totalLoan,
          remainingTotalUnits: loan.remainingTotalUnits,
          processedBy: userId,
        });

        // Set the status after the loan update
        status = {
          success: true,
          message: "Existing loan updated successfully",
          data: loan,
        };
      } else {
        // Create a new loan
        loan = new LoanModel({
          unitId,
          memberId,
          amount: loanAmount,
          processedBy: userId,
          remainingTotalUnits: unit.totalUnit - loanAmount,
          loanTaken: loanAmount,
          totalLoan: loanAmount, // Set totalLoan to the new loan amount
        });

        // Log the creation in LoanHistory
        await LoanHistory.create({
          unitId,
          memberId,
          action: Action.CREATED,
          amount: loan.amount,
          processedBy: userId,
          remainingTotalUnits: loan.remainingTotalUnits,
          loanTaken: loan.loanTaken,
          totalLoan: loan.totalLoan,
        });

        // Set the status after creating a new loan
        status = {
          success: true,
          message: "Loan granted and created successfully",
          data: loan,
        };
      }

      // Deduct the loan amount from the total units
      unit.totalUnit -= loanAmount;
      await unit.save();
      await loan.save();

      return res.status(201).json(status);
    } catch (error: any) {
      console.error("Error creating or updating loan:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async singleLoan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const loan = await LoanModel.findById(id);
      if (!loan) {
        return res
          .status(404)
          .json({ success: false, message: "Loan not found" });
      }
      return res.status(200).json({
        success: true,
        message: "Single loan data fetched successfully",
        data: loan,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Error retrieving single loan",
        error: error.message,
      });
    }
  }

  // get all loans
  static async getAllLoans(req: Request, res: Response) {
    try {
      const loans = await LoanModel.find()
        .populate("unitId")
        .populate("memberId")
        .populate("processedBy");
      const length = await LoanModel.countDocuments();

      return res.status(200).json({
        success: true,
        message: "Loans fetched successfully",
        length: length,
        data: loans,
      });
    } catch (error: any) {
      console.error("Error fetching loans:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // update loan
  static async updateLoan(req: Request, res: Response) {
    const { id } = req.params;
    const { amount } = req.body;

    try {
      const loan = await LoanModel.findById(id);

      if (!loan) {
        return res.status(404).json({
          success: false,
          message: "Loan not found",
        });
      }

      const loanAmount = parseFloat(amount);
      if (isNaN(loanAmount)) {
        return res.status(400).json({
          success: false,
          message: "Invalid loan amount",
        });
      }

      loan.amount = loanAmount; // Set the loan amount to the new amount
      loan.loanTaken += loanAmount;
      loan.totalLoan += loanAmount; // Increment totalLoan by the new loan amount
      await loan.save();

      return res.status(200).json({
        success: true,
        message: "Loan updated successfully",
        data: loan,
      });
    } catch (error: any) {
      console.error("Error updating loan:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async deleteLoan(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const deletedLoan = await LoanModel.findByIdAndDelete(id);
      if (!deletedLoan) {
        return res.status(404).json({
          success: false,
          message: "Loan not found",
        });
      }

      // Refund the loan amount back to the total units
      const unit = await UnitModel.findById(deletedLoan.unitId);
      if (unit) {
        unit.totalUnit += deletedLoan.amount;
        await unit.save();
      }

      return res.status(200).json({
        success: true,
        message: "Loan deleted successfully",
        data: deletedLoan,
      });
    } catch (error: any) {
      console.error("Error deleting loan:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // New recentLoans method to fetch loans history
  static async recentLoans(req: Request, res: Response) {
    try {
      const { memberId } = req.params; // Get memberId from route params, if provided

      // Build the query object
      const query: any = {};
      if (memberId) {
        query.memberId = memberId; // If memberId is provided, filter by it
      }
      // Fetch the recent loans, optionally filtered by memberId
      const recentLoans = await LoanHistory.find(query)
        .populate("memberId")
        .populate("processedBy")
        .sort({ createdAt: -1 });

      // Return success response
      return res.status(200).json({
        success: true,
        message: "Recent loans actions fetched successfully",
        data: recentLoans,
      });
    } catch (error: any) {
      console.error("Error fetching recent loans:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
