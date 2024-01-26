//create a doctor

import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../middleware/catchAsynceErroe";
import ErrorHandler from "../utils/ErrorHandler";
import userModel from "../models/userModel";
import {
  getAllAdminService,
  getAllDoctorService,
  getAllUsersService,
  updateUserRoleService,
} from "../services/userService";
import { redis } from "../utils/redis";

//create doctor --only admin
export const createDoctor = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        email,
        password,
        specialist,
        experience,
        education,
        phoneNumber,
        ChemberAddress,
        isVerified,
        role,
      } = req.body;
      const isEmailExist = await userModel.findOne({ email: email });
      if (isEmailExist) {
        return next(new ErrorHandler("Email already exists", 400));
      }
      const doctor = await userModel.create({
        name,
        email,
        password,
        specialist,
        experience,
        education,
        phoneNumber,
        ChemberAddress: [ChemberAddress],
        isVerified,
        role,
      });
      res
        .status(201)
        .json({ success: true, message: "Doctor Account has been activated" });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//get all users ---only for admin
export const getAllUsers = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllUsersService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//update user role --- only for admin
export const updateUserRole = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, role } = req.body;
      updateUserRoleService(res, id, role);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//delete user --- only for admin
export const deleteUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await userModel.findById(id);
      if (!user) {
        return next(new ErrorHandler("User not found", 400));
      }
      await user.deleteOne({ id });
      await redis.del(id);
      res.status(200).json({
        status: "success",
        message: "User deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// get all doctors --only for admin

export const getAllDoctors = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllDoctorService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
// get all admin
export const getAllAdmin = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllAdminService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
