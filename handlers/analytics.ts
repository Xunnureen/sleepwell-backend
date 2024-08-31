import { Request, Response } from "express";
import mongoose from "mongoose";
import UnitModel from "../models/Unit";
import LoanModel from "../models/Loan";
import RepaymentModel from "../models/Repayment";

export class AnalyticsController {
  static async getUnitsAnalytics(req: Request, res: Response) {
    const { memberId } = req.params;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let memberIdFilter = {};
    if (memberId) {
      memberIdFilter = { memberId: new mongoose.Types.ObjectId(memberId) };
    }

    // Pipeline to calculate monthly units
    const monthlyPipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, currentMonth, 1),
            $lt: new Date(currentYear, currentMonth + 1, 1),
          },
          ...memberIdFilter, // Filter by memberId if provided
        },
      },
      {
        $group: {
          _id: null,
          monthlyUnits: { $sum: "$units" },
        },
      },
    ];

    // Pipeline to calculate overall units
    const overallPipeline = [
      {
        $match: {
          ...memberIdFilter, // Filter by memberId if provided
        },
      },
      {
        $group: {
          _id: null,
          overallUnits: { $sum: "$units" },
        },
      },
    ];

    try {
      const [monthlyResult] = await UnitModel.aggregate(monthlyPipeline);
      const [overallResult] = await UnitModel.aggregate(overallPipeline);

      return res.status(200).json({
        success: true,
        message: "Monthly and Overall Units retrieved successfully",
        data: {
          monthlyUnits: monthlyResult?.monthlyUnits || 0,
          overallUnits: overallResult?.overallUnits || 0,
        },
      });
    } catch (error: any) {
      console.error("Error fetching units analytics:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async getIncomeAnalytics(req: Request, res: Response) {
    const { memberId } = req.params;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let memberIdFilter = {};
    if (memberId) {
      memberIdFilter = { memberId: new mongoose.Types.ObjectId(memberId) };
    }

    // Pipeline to calculate monthly income
    const monthlyPipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, currentMonth, 1),
            $lt: new Date(currentYear, currentMonth + 1, 1),
          },
          ...memberIdFilter, // Filter by memberId if provided
        },
      },
      {
        $group: {
          _id: null,
          monthlyTotalUnit: { $sum: "$totalUnit" },
        },
      },
    ];

    // Pipeline to calculate overall income
    const overallPipeline = [
      {
        $match: {
          ...memberIdFilter, // Filter by memberId if provided
        },
      },
      {
        $group: {
          _id: null,
          overallTotalUnit: { $sum: "$totalUnit" },
        },
      },
    ];

    try {
      const [monthlyResult] = await UnitModel.aggregate(monthlyPipeline);
      const [overallResult] = await UnitModel.aggregate(overallPipeline);

      return res.status(200).json({
        success: true,
        message: "Monthly and Overall Income analytics retrieved successfully",
        data: {
          monthlyTotalUnit: monthlyResult?.monthlyTotalUnit || 0,
          overallTotalUnit: overallResult?.overallTotalUnit || 0,
        },
      });
    } catch (error: any) {
      console.error("Error fetching income analytics:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async getLoansAnalytics(req: Request, res: Response) {
    const { memberId } = req.params;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let memberIdFilter = {};
    if (memberId) {
      memberIdFilter = { memberId: new mongoose.Types.ObjectId(memberId) };
    }

    // Pipeline to calculate monthly loans
    const monthlyPipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, currentMonth, 1),
            $lt: new Date(currentYear, currentMonth + 1, 1),
          },
          ...memberIdFilter, // Filter by memberId if provided
        },
      },
      {
        $group: {
          _id: null,
          monthlyTotalLoans: { $sum: "$totalLoan" },
        },
      },
    ];

    // Pipeline to calculate overall loans
    const overallPipeline = [
      {
        $match: {
          ...memberIdFilter, // Filter by memberId if provided
        },
      },
      {
        $group: {
          _id: null,
          overallTotalLoans: { $sum: "$totalLoan" },
        },
      },
    ];

    try {
      const [monthlyResult] = await LoanModel.aggregate(monthlyPipeline);
      const [overallResult] = await LoanModel.aggregate(overallPipeline);

      return res.status(200).json({
        success: true,
        message: "Monthly and Overall Loan analytics retrieved successfully",
        data: {
          monthlyTotalLoans: monthlyResult?.monthlyTotalLoans || 0,
          overallTotalLoans: overallResult?.overallTotalLoans || 0,
        },
      });
    } catch (error: any) {
      console.error("Error fetching loan analytics:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async getRepaymentsAnalytics(req: Request, res: Response) {
    const { memberId } = req.params;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    let memberIdFilter = {};
    if (memberId) {
      memberIdFilter = { memberId: new mongoose.Types.ObjectId(memberId) };
    }

    // Pipeline to calculate monthly repayments
    const monthlyPipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, currentMonth, 1),
            $lt: new Date(currentYear, currentMonth + 1, 1),
          },
          ...memberIdFilter, // Filter by memberId if provided
        },
      },
      {
        $group: {
          _id: null,
          monthlyTotalRepayments: { $sum: "$totalRepayment" },
        },
      },
    ];

    // Pipeline to calculate overall repayments
    const overallPipeline = [
      {
        $match: {
          ...memberIdFilter, // Filter by memberId if provided
        },
      },
      {
        $group: {
          _id: null,
          overallTotalRepayments: { $sum: "$totalRepayment" },
        },
      },
    ];

    try {
      const [monthlyResult] = await RepaymentModel.aggregate(monthlyPipeline);
      const [overallResult] = await RepaymentModel.aggregate(overallPipeline);

      return res.status(200).json({
        success: true,
        message: "Repayments analytics retrieved successfully",
        data: {
          monthlyTotalRepayments: monthlyResult?.monthlyTotalRepayments || 0,
          overallTotalRepayments: overallResult?.overallTotalRepayments || 0,
        },
      });
    } catch (error: any) {
      console.error("Error fetching repayments analytics:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
