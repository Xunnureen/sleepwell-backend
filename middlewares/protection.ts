import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";



// Define a custom type for the Request object
interface userRequest extends Request {
  userId?: string;
}

export const verifyToken = (
  req: userRequest,
  res: Response,
  next: NextFunction,
) => {
  const excludedPaths = ["/api/v1/auth/login"];

  if (excludedPaths.includes(req.path)) {
    return next();
  }

  const token: string | undefined = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied" });
  }

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as { userId: string }; // Add type annotation for decodedToken

    req.userId = decodedToken.userId; // Add userId directly to the request object

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid token", error });
  }
};