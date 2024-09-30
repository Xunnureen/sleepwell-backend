import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { RoleName } from "../utils/types";
import { StatusEnum } from "../utils/types";
//import bcrypt from "bcrypt";

export interface IMember extends Document {
  memberName: string;
  phoneNumber: string;
  sp_sj_no: string;
  ippsNo: string;
  status: StatusEnum;
  readonly registrationDate: Date;
  createdBy: Types.ObjectId;
}

const memberSchema = new Schema<IMember>(
  {
    memberName: { type: String, required: true },
    phoneNumber: {
      type: String,
      required: true,
      maxlength: 11,
      minlength: 11,
      unique: true,
    },
    sp_sj_no: { type: String, required: true },
    ippsNo: { type: String, required: true, minlength: 4, maxlength: 20 },
    status: {
      type: String,
      enum: Object.values(StatusEnum),
      default: StatusEnum.ACTIVE,
    },
    registrationDate: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

const MemberModel =
  mongoose.models.Member || mongoose.model<IMember>("Member", memberSchema);

export default MemberModel;
