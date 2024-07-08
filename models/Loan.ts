import { Schema, model, Document } from "mongoose";

// Define the Loan interface
interface Loan extends Document {
  unitId: Schema.Types.ObjectId;
  amount: number;
  interest?: number;
  guarantor?: string;
  date: Date;
  processedBy: Schema.Types.ObjectId;
  remainingTotalUnits: number;
}

// Define the Loan schema
const LoanSchema = new Schema<Loan>({
  unitId: { type: Schema.Types.ObjectId, ref: "Unit", required: true },
  amount: { type: Number, required: true },
  interest: { type: Number, default: 0 },
  guarantor: { type: String, required: false },
  date: { type: Date, default: Date.now },
  processedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  remainingTotalUnits: { type: Number, required: true },
});

// Create the Loan model
const LoanModel = model<Loan>("Loan", LoanSchema);

export default LoanModel;
