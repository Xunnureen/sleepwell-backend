import { Request, Response } from "express";
import UnitModel from "../models/Unit";
import moment from "moment";

const PER_UNIT = 2500;

export class Unit {
  static async create(req: Request, res: Response) {
    const { memberId, units } = req.body;

    if (!memberId || !units) {
      return res.status(400).json({
        success: false,
        message: "Please provide required fields",
      });
    }

    const currentMonthStart = moment().startOf("month").toDate();
    const currentMonthEnd = moment().endOf("month").toDate();

    try {
      const existingUnit = await UnitModel.findOne({
        memberId,
        createdDate: { $gte: currentMonthStart, $lte: currentMonthEnd },
      });

      if (existingUnit) {
        return res.status(400).json({
          success: false,
          message: "You can only create a unit once per month",
        });
      }

      const TotalUnits = units * PER_UNIT;

      const newUnit = await UnitModel.create({
        memberId,
        units,
        totalUnit: TotalUnits,
        processedBy: memberId,
        lastUpdated: new Date(),
        createdDate: new Date(),
      });

      const length = await UnitModel.countDocuments();

      return res.status(201).json({
        success: true,
        message: "Unit created successfully",
        length: length,
        data: newUnit,
      });
    } catch (error: any) {
      console.error("Error creating unit:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async updateUnit(req: Request, res: Response) {
    const { id } = req.params;
    const { units } = req.body;

    try {
      const unit = await UnitModel.findById(id);

      if (!unit) {
        return res.status(404).json({
          success: false,
          message: "Unit not found",
        });
      }

      const totalUnit = units * PER_UNIT;

      unit.units = units;
      unit.totalUnit = totalUnit;
      unit.lastUpdated = new Date();

      await unit.save();

      return res.status(200).json({
        success: true,
        message: "Unit updated successfully",
        data: unit,
      });
    } catch (error: any) {
      console.error("Error updating unit:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async getUnit(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const unit = await UnitModel.findById(id).populate("memberId");

      if (!unit) {
        return res.status(404).json({
          success: false,
          message: "Unit not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Unit fetched successfully",
        data: unit,
      });
    } catch (error: any) {
      console.error("Error fetching unit:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async getAllUnits(req: Request, res: Response) {
    try {
      const units = await UnitModel.find().populate("processedBy");
      const unitLength = await UnitModel.countDocuments();
      return res.status(200).json({
        success: true,
        message: "Units fetched successfully",
        length: unitLength,
        data: units,
      });
    } catch (error: any) {
      console.error("Error fetching units:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async deleteUnit(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const deletedUnit = await UnitModel.findByIdAndDelete(id);
      if (!deletedUnit) {
        return res.status(404).json({
          success: false,
          message: "Unit not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Unit deleted successfully",
        data: deletedUnit,
      });
    } catch (error: any) {
      console.error("Error deleting unit:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
