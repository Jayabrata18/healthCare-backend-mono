import { NextFunction, Request, Response } from "express";

const catchAsyncError = (theFunc: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(theFunc(req, res, next)).catch(next);
  };
};

export default catchAsyncError;
