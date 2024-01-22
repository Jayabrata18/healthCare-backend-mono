import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { createDoctor } from "../controllers/adminContrller";

const adminRouter = express.Router();

adminRouter.post(
  "/create-doctor",
  isAuthenticated,
  authorizeRoles("admin"),
  createDoctor
);
export default adminRouter;
