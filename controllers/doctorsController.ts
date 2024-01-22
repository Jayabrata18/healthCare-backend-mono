import { NextFunction } from "express";
import catchAsyncError from "../middleware/catchAsynceErroe";
import doctorModel from "../models/doctorModel";
import ErrorHandler from "../utils/ErrorHandler";
import { sendToken, sendToken2 } from "../utils/jwt";
import { RequestDoctorApi } from "../types/custom";

interface IDoctorLoginRequest {
  email: string;
  password: string;
}
export const loginDoctor = catchAsyncError(
  async (req: RequestDoctorApi, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as IDoctorLoginRequest;
      const doctor = await doctorModel
        .findOne({ email: email })
        .select("+password");
      if (!email || !password) {
        return next(new ErrorHandler("Please enter email & password", 400));
      }
      if (!doctor) {
        return next(new ErrorHandler("User not found", 400));
      }
      const isPasswordMatch = await doctor.comparePassword(password);
      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid email or password", 400));
      }
      sendToken2(doctor, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
