import { Schema, model, Document } from "mongoose";

export interface IRepayment extends Document {
  loanId: Schema.Types.ObjectId;
  repaymentAmount: number;
  processedBy: Schema.Types.ObjectId;
  createdDate: Date;
}

const repaymentSchema = new Schema<IRepayment>({
  loanId: { type: Schema.Types.ObjectId, ref: "Loan", required: true },
  repaymentAmount: { type: Number, required: true },
  processedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdDate: { type: Date, default: Date.now },
});

const RepaymentModel = model<IRepayment>("Repayment", repaymentSchema);

export default RepaymentModel;
