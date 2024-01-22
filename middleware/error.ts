import ErrorHandler from "../utils/ErrorHandler";
import express, { NextFunction, Request, Response } from "express";

export const ErrorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  //wrong mongodb  id
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(400, message);
  }
  //duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(400, message);
  }
  //wrong jwt error
  if (err.name === "JsonWebTokenError") {
    const message = `Json Web Token is invalid. Try Again!!!`;
    err = new ErrorHandler(400, message);
  }
  //jwt expire error
  if (err.name === "TokenExpiredError") {
    const message = `Json Web Token is expired. Try Again!!!`;
    err = new ErrorHandler(400, message);
  }
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
