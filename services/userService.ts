import { Response } from "express";
import userModel from "../models/userModel";
import { redis } from "../utils/redis";

export const getUserById = async (id: string, res: Response) => {
  const userJson = await redis.get(id);

  if (userJson) {
    const user = JSON.parse(userJson);
    res.status(201).json({
      status: "success",
      user,
    });
  }
};
export const getUserById2 = async (id: string, res: Response) => {
  const userJson = await redis.get(id);

  if (userJson) {
    const user = JSON.parse(userJson);
    return { _id: user._id, name: user.name };
  }
};

//get all user
export const getAllUsersService = async (res: Response) => {
  const users = await userModel.find({ role: "user" }).sort({ createdAt: -1 });
  const count = await userModel.countDocuments({ role: "user" });
  res.status(201).json({
    status: "success",
    count,
    users,
  });
};
//update user role
export const updateUserRoleService = async (
  res: Response,
  id: string,
  role: string
) => {
  const user = await userModel.findByIdAndUpdate(id, { role }, { new: true });

  res.status(201).json({
    status: "success",
    user,
  });
};

//get all doctors

export const getAllDoctorService = async (res: Response) => {
  const users = await userModel
    .find({ role: "doctor" })
    .sort({ createdAt: -1 });
  const count = await userModel.countDocuments({ role: "doctor" });
  res.status(201).json({
    status: "success",
    count,
    users,
  });
};

// get doctor by specialization
export const getDoctorBySpecializationService = async (
  res: Response,
  specialization: string
) => {
  const users = await userModel
    .find({ role: "doctor", specialist: specialization })
    .sort({ createdAt: -1 });
  const count = await userModel.countDocuments({
    role: "doctor",
    specialist: specialization,
  });

  res.status(201).json({
    status: "success",
    count,
    users,
  });
};

//get all admin
export const getAllAdminService = async (res: Response) => {
  const users = await userModel.find({ role: "admin" }).sort({ createdAt: -1 });
  const count = await userModel.countDocuments({ role: "admin" });
  res.status(201).json({
    status: "success",
    count,
    users,
  });
};
