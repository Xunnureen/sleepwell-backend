import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { RoleName } from "../utils/types";

export const checkRole = (allowedRoles: RoleName[] | string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
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
      // Fetch the user using the userId
      const user = await UserService.getUserById(userId);

      // Check if the user exists
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      if (allowedRoles.includes(user?.role)) {
        next();
      } else {
        res
          .status(403)
          .json({
            success: false,
            message:
              "Access denied. You do not have sufficient permissions to perform this action",
          });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Error fetching user." });
    }
  };
};
