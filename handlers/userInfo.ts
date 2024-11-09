import { Request, Response } from "express";
import UnitModel from "../models/Unit";
import LoanModel from "../models/Loan";
import RepaymentModel from "../models/Repayment";
import MemberModel from "../models/Members";

const fetchDetailsByIdentityNo = async (req: Request, res: Response) => {
  const { sp_sj_no } = req.params;

  try {
    // Find member by phone number
    const member = await MemberModel.findOne({ sp_sj_no });
    if (!member) {
      return res
        .status(404)
        .json({ message: `No member exist with such ${sp_sj_no} ID` });
    }

    // Find units by member ID
    const units = await UnitModel.find({ memberId: member._id });

    // Find loans by unit IDs
    const loans = await LoanModel.find({
      unitId: { $in: units.map((unit) => unit._id) },
    });

    // Find repayments by loan IDs
    const repayments = await RepaymentModel.find({
      loanId: { $in: loans.map((loan) => loan._id) },
    });

    res.status(200).json({
      member,
      units,
      loans,
      repayments,
    });
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

export default fetchDetailsByIdentityNo;
