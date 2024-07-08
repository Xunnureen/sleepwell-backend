import { Schema, model, Document } from "mongoose";

interface Unit extends Document {
  memberId: Schema.Types.ObjectId;
  units: number;
  totalUnit: number;
  createdDate: Date;
  lastUpdated: Date;
  processedBy: Schema.Types.ObjectId;
}

const UnitSchema = new Schema<Unit>({
  memberId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  units: { type: Number, required: true },
  totalUnit: { type: Number, required: true },
  createdDate: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  processedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const UnitModel = model<Unit>("Unit", UnitSchema);

export default UnitModel;
