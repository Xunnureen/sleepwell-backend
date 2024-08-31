import mongoose, { Schema, Document } from "mongoose";
import { Action } from "../utils/types";

export interface IRepaymentHistory extends Document {
  loanId: Schema.Types.ObjectId;
  action: Action;
  memberId: Schema.Types.ObjectId;
  repaymentAmount: number; // Updated field name
  balance: number;
  processedBy: Schema.Types.ObjectId;
  previousRemainingTotalUnits: number; // New field
  currentRemainingTotalUnits: number; // New field
  totalRepayment: number; // New field for tracking cumulative repayments
}

const RepaymentHistorySchema: Schema = new Schema(
  {
    loanId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Loan",
    },
    action: { type: String, enum: Object.values(Action), required: true },
    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    repaymentAmount: {
      type: Number,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    previousRemainingTotalUnits: {
      type: Number,
      required: true,
    },
    currentRemainingTotalUnits: {
      type: Number,
      required: true,
    },
    totalRepayment: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

const RepaymentHistory = mongoose.model<IRepaymentHistory>(
  "RepaymentHistory",
  RepaymentHistorySchema
);
export default RepaymentHistory;
