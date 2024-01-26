import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { updatePassword } from "../controllers/doctorsController";

const doctorRouter = express.Router();

doctorRouter.post(
  "/updatepassword",
  isAuthenticated,
  authorizeRoles("Doctor"),
  updatePassword
);
export default doctorRouter;
