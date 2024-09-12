import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface RequestWithUser extends Request {
  user?: any;
}

export const authenticateToken = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  console.log("Request headers:", req.headers);
  console.log("Request cookies:", req.cookies);

  const token = req.cookies.accessToken;
  console.log("Token:", token);

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    console.log("Invalid token");
    return res.status(403).json({ message: "Invalid token" });
  }
};
