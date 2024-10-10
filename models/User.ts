import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { RoleName } from "../utils/types";
import { StatusEnum } from "../utils/types";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  fullName: string;
  phoneNumber: string;
  email?: string;
  password: string;
  isDefaultPassword: boolean;
  role: RoleName;
  status: StatusEnum;
  createdBy: Types.ObjectId;
  memberId: Types.ObjectId;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
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
    role: { type: String, enum: Object.values(RoleName), required: true },
    status: {
      type: String,
      enum: Object.values(StatusEnum),
      default: StatusEnum.ACTIVE,
    },
    memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

userSchema.pre<IUser>("save", async function (next) {
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

userSchema.methods.comparePassword = async function (
  userPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(userPassword, this.password);
  } catch (error) {
    throw error;
  }
};

const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default UserModel;
