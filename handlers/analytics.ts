import { Request, Response } from "express";
import UnitModel from "../models/Unit";
import LoanModel from "../models/Loan";
import RepaymentModel from "../models/Repayment";
import moment from "moment";

export class AnalyticsController {
  static async getUnitsAnalytics(req: Request, res: Response) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    // this pipeline calculate monthly
    const monthlyPipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, currentMonth, 28),
            $lt: new Date(currentYear, currentMonth + 1, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          monthlyUnits: { $sum: "$units" },
        },
      },
    ];

    const overallPipeline = [
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

      console.log("Monthly Result:", monthlyResult); // Log monthly result
      console.log("Overall Result:", overallResult); // Log overall result

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
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    // this pipeline calculate monthly
    const monthlyPipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, currentMonth, 28),
            $lt: new Date(currentYear, currentMonth + 1, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          monthlyTotalIncome: { $sum: "$income" },
        },
      },
    ];

    const overallPipeline = [
      {
        $group: {
          _id: null,
          overallTotalIncome: { $sum: "$income" },
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
          monthlyTotalIncome: monthlyResult?.monthlyTotalIncome || 0,
          overallTotalIncome: overallResult?.overallTotalIncome || 0,
        },
      });
    } catch (error: any) {
      console.error("Error fetching Income analytics:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  //loan analytics
  static async getLoansAnalytics(req: Request, res: Response) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // this pipeline calculate monthly
    const monthlyPipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, currentMonth, 28),
            $lt: new Date(currentYear, currentMonth + 1, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          monthlyTotalLoans: { $sum: "$totalLoan" },
        },
      },
    ];

    const overallPipeline = [
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
      console.error("Error fetching Loan analytics:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  //Repayment
  static async getRepaymentsAnalytics(req: Request, res: Response) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    // this pipeline calculate monthly
    const monthlyPipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, currentMonth, 28),
            $lt: new Date(currentYear, currentMonth + 1, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          monthlyTotalRepayments: { $sum: "$totalRepayment" },
        },
      },
    ];

    const overallPipeline = [
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

/*
import { Request, Response } from "express";
import UnitModel from "../models/Unit";
import LoanModel from "../models/Loan";
import RepaymentModel from "../models/Repayment";
import moment from "moment";

export class AnalyticsController {
  static async getUnitsAnalytics(req: Request, res: Response) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyPipeline = [
      {
        $match: {
          updatedAt: {
            $gte: new Date(currentYear, currentMonth, 1),
            $lt: new Date(currentYear, currentMonth + 1, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          monthlyUnits: { $sum: "$units" },
        },
      },
    ];

    const overallPipeline = [
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

      console.log("Monthly Result:", monthlyResult); // Log monthly result
      console.log("Overall Result:", overallResult); // Log overall result

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
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyPipeline = [
      {
        $match: {
          updatedAt: {
            $gte: new Date(currentYear, currentMonth, 1),
            $lt: new Date(currentYear, currentMonth + 1, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          monthlyTotalIncome: { $sum: "$income" },
        },
      },
    ];

    const overallPipeline = [
      {
        $group: {
          _id: null,
          overallTotalIncome: { $sum: "$income" },
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
          monthlyTotalIncome: monthlyResult?.monthlyTotalIncome || 0,
          overallTotalIncome: overallResult?.overallTotalIncome || 0,
        },
      });
    } catch (error: any) {
      console.error("Error fetching Income analytics:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  //loan analytics
  static async getLoansAnalytics(req: Request, res: Response) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyPipeline = [
      {
        $match: {
          updatedAt: {
            $gte: new Date(currentYear, currentMonth, 1),
            $lt: new Date(currentYear, currentMonth + 1, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          monthlyTotalLoans: { $sum: "$totalLoan" },
        },
      },
    ];

    const overallPipeline = [
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
      console.error("Error fetching Loan analytics:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  //Repayment
  static async getRepaymentsAnalytics(req: Request, res: Response) {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyPipeline = [
      {
        $match: {
          updatedAt: {
            $gte: new Date(currentYear, currentMonth, 1),
            $lt: new Date(currentYear, currentMonth + 1, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          monthlyTotalRepayments: { $sum: "$totalRepayment" },
        },
      },
    ];

    const overallPipeline = [
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
*/
