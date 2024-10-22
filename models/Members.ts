import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { RoleName } from "../utils/types";
import { StatusEnum } from "../utils/types";
import bcrypt from "bcrypt";

export interface IMember extends Document {
  memberName: string;
  phoneNumber: string;
  sp_sj_no: string;
  ippsNo: string;
  status: StatusEnum;
  email?: string;
  password: string;
  isDefaultPassword: boolean;
  readonly registrationDate: Date;
  createdBy: Types.ObjectId;

  // Add comparePassword method to the interface
  comparePassword(candidatePassword: string): Promise<boolean>;
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
    password: { type: String, required: true, minlength: 8 },
    email: { type: String, lowercase: true, trim: true, required: false },
    isDefaultPassword: { type: Boolean, required: true, default: true },
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

memberSchema.pre<IMember>("save", async function (next) {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    //console.log("Pass", this.password);
    this.password = hashedPassword;
    next();
  } catch (error: any) {
    next(error);
  }
});

memberSchema.methods.comparePassword = async function (
  memberPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(memberPassword, this.password);
  } catch (error) {
    throw error;
  }
};

const MemberModel =
  mongoose.models.Member || mongoose.model<IMember>("Member", memberSchema);

export default MemberModel;
