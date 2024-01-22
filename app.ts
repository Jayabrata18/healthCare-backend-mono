import express, { NextFunction, Request, Response } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/userRoutes";
// import orderRouter from "./routes/orderRoute";
import notificationRoute from "./routes/notificationRoute";
import adminRouter from "./routes/adminRoutes";

require("dotenv").config();

app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(cors());

//routes
app.use("/api/v1/users", userRouter);
// app.use("/api/v1", orderRouter);
app.use("/api/v1", notificationRoute);
app.use("/api/v1", adminRouter);

//api
app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("Hello World!! It is api port!!!");
});

app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ success: true, message: "API is Working!" });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);
