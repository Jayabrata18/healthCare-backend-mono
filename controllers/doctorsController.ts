import { NextFunction, Response } from "express";
import catchAsyncError from "../middleware/catchAsynceErroe";
import ErrorHandler from "../utils/ErrorHandler";
import { sendToken } from "../utils/jwt";


//update doctor password
export const updatePassword = catchAsyncError(async (req: any, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;
    const doctor = await req.doctor.comparePassword(currentPassword);
    if (!doctor) {
        return next(new ErrorHandler("Password is incorrect", 400));
    }
    doctor.password = newPassword;
    await doctor.save();
    sendToken(doctor, 200, res);
});
