import mongoose, { Schema, Document } from "mongoose";

export interface IRepayment extends Document {
  loanId: Schema.Types.ObjectId;
  memberId: Schema.Types.ObjectId;
  repaymentAmount: number; // Updated field name
  balance: number;
  processedBy: Schema.Types.ObjectId;
  previousRemainingTotalUnits: number; // New field
  currentRemainingTotalUnits: number; // New field
  totalRepayment: number; // New field for tracking cumulative repayments
}

const RepaymentSchema: Schema = new Schema({
  loanId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Loan",
  },
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
    default: 0,
  },
});

const RepaymentModel = mongoose.model<IRepayment>("Repayment", RepaymentSchema);
export default RepaymentModel;
