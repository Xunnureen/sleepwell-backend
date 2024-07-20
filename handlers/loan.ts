import { Request, Response } from "express";
import LoanModel from "../models/Loan";
import UnitModel from "../models/Unit";

const MIN_TOTAL_UNIT = 2500; // Define the minimum total units required

export class Loan {
  static async create(req: Request, res: Response) {
    const { memberId, unitId, amount } = req.body;

    if (!memberId || !unitId || !amount) {
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

      // Check if the loan amount is greater than the total units
      if (amount > unit.totalUnit) {
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
      let previousAmount = 0;
      let updatedAmount = amount;
      let status = {};

      if (loan) {
        // Update the existing loan
        previousAmount = loan.amount;
        loan.amount += amount;
        updatedAmount = loan.amount;
        loan.previousAmount = previousAmount;
        loan.updatedAmount = updatedAmount;
        loan.remainingTotalUnits -= amount;
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
          amount,
          processedBy: memberId,
          remainingTotalUnits: unit.totalUnit - amount,
          previousAmount: previousAmount,
          updatedAmount: updatedAmount,
        });
        status = {
          success: true,
          message: "Loan granted and created successfully",
          data: loan,
        };
      }

      // Deduct the loan amount from the total units
      unit.totalUnit -= amount;
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

  // get all units
  static async getAllLoans(req: Request, res: Response) {
    try {
      const loans = await LoanModel.find()
        .populate("unitId")
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

      loan.amount = amount !== undefined ? amount : loan.amount;

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
}
