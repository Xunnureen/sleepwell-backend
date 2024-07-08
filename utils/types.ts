import { Document, Types } from "mongoose";

export enum RoleName {
  ADMIN = "admin",
  MEMBER = "member"
  
}

export enum StatusEnum {
  ACTIVE = "active",
  INACTIVE = "inactive",
}