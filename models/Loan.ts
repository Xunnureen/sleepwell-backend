import mongoose, { Schema, Document } from "mongoose";

export interface ILoan extends Document {
  unitId: Schema.Types.ObjectId;
  memberId: Schema.Types.ObjectId;
  amount: number;
  remainingTotalUnits: number;
  processedBy: string;
  previousAmount?: number;
  updatedAmount?: number;
  totalLoan: number; // New field to track total loan taken
}

const LoanSchema: Schema = new Schema({
  unitId: { type: Schema.Types.ObjectId, ref: "Unit", required: true },
  memberId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  remainingTotalUnits: { type: Number, required: true },
  processedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  previousAmount: { type: Number },
  updatedAmount: { type: Number },
  totalLoan: { type: Number, default: 0 }, // Initialize totalLoan to 0
});

// Ensure a unique index on unitId and memberId to prevent duplicate entries
LoanSchema.index({ unitId: 1, memberId: 1 }, { unique: true });

export default mongoose.model<ILoan>("Loan", LoanSchema);
