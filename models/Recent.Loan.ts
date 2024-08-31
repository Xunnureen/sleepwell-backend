import mongoose, { Schema, Document } from "mongoose";
import { Action } from "../utils/types"; // Assuming Action enum is here

export interface ILoanHistory extends Document {
  memberId: Schema.Types.ObjectId;
  action: Action;
  amount: number;
  loanTaken: number;
  totalLoan: number;
  remainingTotalUnits: number;
  processedBy: Schema.Types.ObjectId;
}

const LoanHistorySchema: Schema = new Schema(
  {
    memberId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, enum: Object.values(Action), required: true },
    amount: { type: Number, required: true },
    loanTaken: { type: Number, required: true },
    totalLoan: { type: Number, required: true },
    remainingTotalUnits: { type: Number, required: true },
    processedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

const LoanHistory = mongoose.model<ILoanHistory>(
  "LoanHistory",
  LoanHistorySchema
);

export default LoanHistory;
