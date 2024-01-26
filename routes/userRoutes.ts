import express from "express";
import {
  activateUser,
  getDoctorBySpecialization,
  getUserCredentials,
  loginUser,
  logoutUser,
  registrationUser,
  socialAuth,
  updateAccessToken,
  updateUserInfo,
  updateUserPassword,
  userReview,
} from "../controllers/userController";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
userRouter.post("/activate-user", activateUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout", isAuthenticated, logoutUser);

userRouter.get("/refresh", updateAccessToken);
userRouter.get("/me", isAuthenticated, getUserCredentials);
userRouter.post("/social-auth", socialAuth);
userRouter.put("/update-user-info", isAuthenticated, updateUserInfo);
userRouter.put("/update-user-password", isAuthenticated, updateUserPassword);
userRouter.get("/:specialization", isAuthenticated, getDoctorBySpecialization);
userRouter.post("/:doctor-review", isAuthenticated, userReview);
export default userRouter;
