import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { createDoctor, deleteUser, getAllUsers, updateUserRole } from "../controllers/adminContrller";

const adminRouter = express.Router();

adminRouter.post(
  "/create-doctor",
  isAuthenticated,
  authorizeRoles("admin"),
  createDoctor
);
adminRouter.get(
  "/get-all-users",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllUsers
);
adminRouter.put(
  "/update-user",
  isAuthenticated,
  authorizeRoles("admin"),
  updateUserRole
);
adminRouter.delete(
  "/delete-user/:id",
  isAuthenticated,
  authorizeRoles("admin"),
  deleteUser
);

export default adminRouter;
