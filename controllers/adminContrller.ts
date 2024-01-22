//create a doctor

import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../middleware/catchAsynceErroe";
import ErrorHandler from "../utils/ErrorHandler";
import userModel from "../models/userModel";
import doctorModel from "../models/doctorModel";

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
      // const isEmailExist = await userModel.findOne({ email: email });
      // if (isEmailExist) {
      //   return next(new ErrorHandler("Email already exists", 400));
      // }
      const doctor = await doctorModel.create({
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
