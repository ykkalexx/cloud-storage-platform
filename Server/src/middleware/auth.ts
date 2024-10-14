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
  const token =
    req.cookies.accessToken || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res
      .status(403)
      .json({
        message:
          error instanceof jwt.JsonWebTokenError
            ? "Invalid token"
            : "Token verification failed",
      });
  }
};
