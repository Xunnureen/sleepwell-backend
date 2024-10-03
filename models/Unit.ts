import { Schema, model, Document } from "mongoose";

interface Unit extends Document {
  memberId: Schema.Types.ObjectId;
  units: number;
  totalUnit: number;
  income: number;
  processedBy: Schema.Types.ObjectId;
}

const UnitSchema = new Schema<Unit>(
  {
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    units: { type: Number, required: true },
    totalUnit: { type: Number, required: true },
    income: { type: Number, default: 0 },
    processedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

const UnitModel = model<Unit>("Unit", UnitSchema);

export default UnitModel;
