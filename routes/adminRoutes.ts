import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import {
  createDoctor,
  deleteUser,
  getAllAdmin,
  getAllDoctors,
  getAllUsers,
  updateUserRole,
} from "../controllers/adminContrller";

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
  "/update-role",
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
adminRouter.get(
  "/get-all-doctors",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllDoctors
);
adminRouter.get(
  "/get-all-admins",
  isAuthenticated,
  authorizeRoles("admin"),
  getAllAdmin
);
export default adminRouter;
