import mongoose, { Schema, Document } from "mongoose";
import { Action } from "../utils/types";

// Define the UnitHistory interface
interface UnitHistory extends Document {
  memberId: mongoose.Types.ObjectId;
  action: Action;
  units: number;
  totalUnit: number;
  income: number;
  processedBy: mongoose.Types.ObjectId;
}

// Define the UnitHistory schema
const UnitHistorySchema = new Schema<UnitHistory>(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    action: { type: String, enum: Object.values(Action), required: false },
    units: { type: Number, required: true },
    totalUnit: { type: Number, required: true },
    income: { type: Number, required: true },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
  },
  { timestamps: true }
);

// Create the UnitHistory model
const UnitHistoryModel = mongoose.model<UnitHistory>(
  "UnitHistory",
  UnitHistorySchema
);

export default UnitHistoryModel;
