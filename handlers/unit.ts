import { Request, Response } from "express";
import UnitModel from "../models/Unit";
import UserModel, { IUser } from "../models/User";
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

    // Convert units to a number
    const unitsNumber = Number(units);

    if (isNaN(unitsNumber)) {
      return res.status(400).json({
        success: false,
        message: "Units must be a valid number",
      });
    }

    try {
      let unit = await UnitModel.findOne({ memberId });

      if (unit) {
        // Update existing unit
        unit.units += unitsNumber;
        unit.totalUnit += unitsNumber * PER_UNIT;
        unit.income += unitsNumber * PER_UNIT; // Increment income
        await unit.save();
        return res.status(200).json({
          success: true,
          message: "Units added to existing unit successfully",
          data: unit,
        });
      } else {
        // Create new unit
        const newUnit = await UnitModel.create({
          memberId,
          units: unitsNumber,
          totalUnit: unitsNumber * PER_UNIT,
          income: unitsNumber * PER_UNIT, // Initialize income
          processedBy: memberId,
        });
        return res.status(201).json({
          success: true,
          message: "Unit created successfully",
          data: newUnit,
        });
      }
    } catch (error: any) {
      console.error("Error creating or updating unit:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  static async getSingleUnit(req: Request, res: Response) {
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

  // get all units
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
