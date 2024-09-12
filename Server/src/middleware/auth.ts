import { Request as ExpressRequest, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "models/User";

interface Request extends ExpressRequest {
  user?: any;
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
    };
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  } catch (error) {
    return res.sendStatus(403);
  }
};
