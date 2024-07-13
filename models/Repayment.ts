import mongoose, { Schema, Document } from "mongoose";

export interface IRepayment extends Document {
  loanId: Schema.Types.ObjectId;
  repaymentAmount: number;
  balance: number;
  processedBy: Schema.Types.ObjectId;
  previousRemainingTotalUnits: number; // New field
  currentRemainingTotalUnits: number; // New field
}

const RepaymentSchema: Schema = new Schema({
  loanId: { type: Schema.Types.ObjectId, ref: "Loan", required: true },
  repaymentAmount: { type: Number, required: true },
  balance: { type: Number, required: true },
  processedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  previousRemainingTotalUnits: { type: Number, required: true }, // New field
  currentRemainingTotalUnits: { type: Number, required: true }, // New field
});

export default mongoose.model<IRepayment>("Repayment", RepaymentSchema);
