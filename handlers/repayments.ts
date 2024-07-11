import { Request, Response } from "express";
import RepaymentModel from "../models/Repayment";
import LoanModel from "../models/Loan"; // Update the path to your Loan model
import UserModel from "../models/User"; // Update the path to your User model

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

      // Validate if processedBy exists
      const user = await UserModel.findById(memberId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Create the repayment
      const newRepayment = await RepaymentModel.create({
        loanId,
        repaymentAmount,
        processedBy: memberId,
      });

      return res.status(201).json({
        success: true,
        message: "Repayment created successfully",
        data: newRepayment,
      });
    } catch (error: any) {
      console.error("Error creating repayment:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

/*export class Repay {
  static async repayLoan(req: Request, res: Response) {
    const { userId, loanId, repaymentAmount } = req.body;

    if (!userId ||!loanId || !repaymentAmount) {
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

      // Validate if repaymentAmount is greater than loan amount
      if (repaymentAmount > loan.amount) {
        return res.status(400).json({
          success: false,
          message: "Repayment amount cannot be greater than loan amount",
        });
      }

      // Deduct the repayment amount from the loan amount
      loan.amount -= repaymentAmount;

      // Find the associated unit
      const unit = await UnitModel.findById(loan.unitId);
      if (!unit) {
        return res.status(404).json({
          success: false,
          message: "Associated unit not found",
        });
      }

      // Update the total units
      unit.totalUnit += repaymentAmount;
      await unit.save();

      await loan.save();

      return res.status(200).json({
        success: true,
        message: "Repayment made successfully",
        balance: loan.amount,
        updatedTotalUnits: unit.totalUnit,
        data: loan,
      });
    } catch (error: any) {
      console.error("Error making repayment:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
*/
