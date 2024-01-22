import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../middleware/catchAsynceErroe";
import NotificationModel from "../models/notificationModel";
import ErrorHandler from "../utils/ErrorHandler";
import cron from "node-cron";

//get all notifications ---only for admin
export const getNotification = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notifications = await NotificationModel.find().sort({
        cratedAt: -1,
      });
      res.status(201).json({
        success: true,
        notifications,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//update notification status ---only admin

export const updateNotification = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notification = await NotificationModel.findById(req.params.id);
      if (!notification) {
        return next(new ErrorHandler("Notification not found", 404));
      } else {
        notification.status
          ? (notification.status = "read")
          : notification?.status;
      }
      await notification.save();
      const notifications = await NotificationModel.find().sort({
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        notifications,
        message: "Notification updated successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//delete notification ---only admin
// cron.schedule("*/5 * * * * *", function(){
//     console.log("----------------------");
//     console.log("running cron");
// })

cron.schedule("0 0 0 * * *", async () => {
  const thirtydaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await NotificationModel.deleteMany({
    status: "read",
    createdAt: { $lt: thirtydaysAgo },
  });
  console.log("Deleted read notifications");
});
