import { Request, Response } from "express";
import UserModel, { IUser } from "../models/User";
import UnitModel from "../models/Unit";
import LoanModel from "../models/Loan";

const fetchDetailsByPhone = async (req: Request, res: Response) => {
  const { phoneNumber } = req.params;

  try {
    // Find user by phone number
    const user = await UserModel.findOne({ phoneNumber });
    if (!user) {
      return res
        .status(404)
        .json({ message: `No User exist with such ${phoneNumber}` });
    }

    // Find units by user ID
    const units = await UnitModel.find({ memberId: user._id });

    // Find loans by unit IDs
    const loans = await LoanModel.find({
      unitId: { $in: units.map((unit) => unit._id) },
    });

    res.status(200).json({
      user,
      units,
      loans,
    });
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

export default fetchDetailsByPhone;
