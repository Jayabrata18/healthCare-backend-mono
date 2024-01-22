import { NextFunction, Response } from "express";
import catchAsyncError from "../middleware/catchAsynceErroe";
import OrderModel from "../models/orderModel";

export const newOrder = catchAsyncError(
  async (data: any, res: Response, next: NextFunction) => {
    const order = await OrderModel.create(data);
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
      // data: {
      //   order: {
      //     _id: course._id.slice(0, 6),
      //     name: course.name,
      //     price: course.price,
      //     date: new Date().toLocaleDateString("en-US", {
      //       year: "numeric",
      //       month: "long",
      //       day: "numeric",
      //     }),
      //   },
      // },
    });
  }
);

//get all orders
export const getAllordersService = async (res: Response) => {
  const orders = await OrderModel.find().sort({ createdAt: -1 });
  res.status(201).json({
    status: "success",
    orders,
  });
};
