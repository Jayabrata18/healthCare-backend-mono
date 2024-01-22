import { Request, Response, NextFunction } from "express";
import catchAsyncError from "./catchAsynceErroe";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";
import { RequestApi } from "../types/custom";

//authenticated user
export const isAuthenticated = catchAsyncError(
  async (req: RequestApi, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token;
    if (!access_token) {
      return next(
        new ErrorHandler("Please login to access this resource", 401)
      );
    }
    const decoded = jwt.verify(
      access_token,
      process.env.ACCESS_TOKEN as string
    ) as JwtPayload;
    if (!decoded) {
      return next(new ErrorHandler("access token is invalid", 401));
    }
    const user = await redis.get(decoded.id);
    if (!user) {
      return next(new ErrorHandler("Please Login again", 401));
    }
    req.user = JSON.parse(user);
    next();
  }
);

//validate user role
export const authorizeRoles = (...roles: string[]) => {
  return (req: RequestApi, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(
          `Role (${req.user?.role}) is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};
