import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { IUser } from "../models/User";

export const checkPasswordChanged = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const excludedPaths = ["/api/v1/auth/login", "/api/v1/healthcheck"];

  if (excludedPaths.includes(req.path)) {
    return next();
  }

  let userId: string;
  if (req.params.userId) {
    userId = req.params.userId;
  } else if (req.query.userId) {
    userId = req.query.userId as string;
  } else if (req.body.userId) {
    userId = req.body.userId as string;
  } else {
    return res.status(400).json({ message: "userId is required." });
  }

  try {
    const user: IUser | null = await UserService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isDefaultPassword) {
      return res.status(403).json({
        message:
          "You must change your password from the default before you can perform this action.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};
