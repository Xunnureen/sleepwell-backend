import UserModel, { IUser } from "../models/User";
import { RoleName } from "../utils/types";

export class UserService {
  static async getUserById(userId: string) {
    const user = await UserModel.findById(userId);
    return user;
  }

  static async createMemberAccount(
    userId: string,
    fullName: string,
    phoneNumber: string,
    email?: string
  ) {
    try {
      const existingUser = await UserModel.findOne({ phoneNumber });

      if (existingUser) {
        return {
          success: false,
          message: "Account with phone number already exists",
        };
      }

      const userData = {
        fullName,
        phoneNumber,
        email: email || "",
        password: phoneNumber,
        role: RoleName.MEMBER,
        createdBy: userId,
      };

      //console.log({ userData });

      const newUser: IUser = await UserModel.create(userData);

      return {
        success: true,
        message: "User created successfully",
        data: newUser,
      };
    } catch (error) {
      console.error("Error creating user:", error);
      return {
        success: false,
        message: "Internal server error",
        error,
      };
    }
  }
}
