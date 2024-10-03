import mongoose, { Schema, Document } from "mongoose";

export interface ILoan extends Document {
  unitId: Schema.Types.ObjectId;
  memberId: Schema.Types.ObjectId;
  amount: number;
  remainingTotalUnits: number;
  processedBy: string;
  loanTaken: number; // New field to track loan taken for repayment
  totalLoan: number;
}

const LoanSchema: Schema = new Schema(
  {
    unitId: { type: Schema.Types.ObjectId, ref: "Unit", required: true },
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    amount: { type: Number, required: true },
    remainingTotalUnits: { type: Number, required: true },
    processedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    loanTaken: { type: Number, default: 0 }, // Initialize loanTaken to 0
    totalLoan: { type: Number, default: 0 },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Ensure a unique index on unitId and memberId to prevent duplicate entries
LoanSchema.index({ unitId: 1, memberId: 1 }, { unique: true });

export default mongoose.model<ILoan>("Loan", LoanSchema);
