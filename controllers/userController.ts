import { NextFunction, Request, Response } from "express";
import userModel, { IUser } from "../models/userModel";
import ErrorHandler from "../utils/ErrorHandler";
import catchAsyncError from "../middleware/catchAsynceErroe";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
// import cloudinary from "cloudinary";
import sendMail from "../utils/sendMail";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwt";
import { redis } from "../utils/redis";
import {
  getAllUsersService,
  getDoctorBySpecializationService,
  getUserById,
  getUserById2,
  updateUserRoleService,
} from "../services/userService";
import { RequestApi } from "../types/custom";

require("dotenv").config();

//register user

interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  // avatar?: string;
}
export const registrationUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      const isEmailExist = await userModel.findOne({ email: email });
      if (isEmailExist) {
        return next(new ErrorHandler("Email already exists", 400));
      }
      const user: IRegistrationBody = {
        name,
        email,
        password,
      };
      const activationToken = createActivationToken(user);
      const activationCode = activationToken.activationCode;
      const data = { user: { name: user.name }, activationCode };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/activationMail.ejs"),
        data
      );
      try {
        await sendMail({
          email: user.email,
          subject: "Activate your account",
          template: "activationMail.ejs",
          data,
        });
        res.status(200).json({
          sucess: true,
          message: `Please check your email: ${user.email} to activate your account!`,
          activationToken: activationToken.token,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
interface IActivationToken {
  token: string;
  activationCode: string;
}
export const createActivationToken = (user: any): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.JWT_PRIVATE_KEY as Secret,
    {
      expiresIn: "5min",
    }
  );
  return { token, activationCode };
};
//activate user
interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}
export const activateUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code } =
        req.body as IActivationRequest;
      const newUser: { user: IUser; activationCode: string } = jwt.verify(
        activation_token,
        process.env.JWT_PRIVATE_KEY as string
      ) as { user: IUser; activationCode: string };
      if (newUser.activationCode !== activation_code) {
        return next(new ErrorHandler("Invalid activation code", 400));
      }
      const { name, email, password } = newUser.user;
      // const existUser = await userModel.findOne({ email: email });
      // if (existUser) {
      //   return next(new ErrorHandler("User already exists", 400));
      // }
      const user = await userModel.create({ name, email, password });
      res
        .status(201)
        .json({ success: true, message: "Account has been activated" });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

////////////////////////////////
//login user

interface ILoginRequest {
  email: string;
  password: string;
}
export const loginUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginRequest;
      const user = await userModel
        .findOne({ email: email })
        .select("+password");
      if (!email || !password) {
        return next(new ErrorHandler("Please enter email & password", 400));
      }
      if (!user) {
        return next(new ErrorHandler("User not found", 400));
      }
      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid email or password", 400));
      }
      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//logout user
export const logoutUser = catchAsyncError(
  async (req: RequestApi, res: Response, next: NextFunction) => {
    try {
      res.cookie("access_token", "", {
        maxAge: 1,
        // httpOnly: true,
      });
      res.cookie("refresh_token", "", {
        maxAge: 1,
        // httpOnly: true,
      });

      const userId = req.user?._id || "";
      redis.del(userId);
      res
        .status(200)
        .json({ success: true, message: "Logged out Sucessfully" });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//update access token
export const updateAccessToken = catchAsyncError(
  async (req: RequestApi, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.cookies.refresh_token as string;
      const decoded = jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN as string
      ) as JwtPayload;
      const message = "Could not refresh token";
      if (!decoded) {
        return next(new ErrorHandler(message, 400));
      }
      const session = await redis.get(decoded.id as string);
      if (!session) {
        return next(new ErrorHandler("Please login to access", 400));
      }
      const user = JSON.parse(session);
      const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN as string,
        { expiresIn: "5m" }
      );
      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN as string,
        { expiresIn: "3d" }
      );
      req.user = user;
      res.cookie("access_token", accessToken, accessTokenOptions);
      res.cookie("refresh_token", refreshToken, refreshTokenOptions);
      await redis.set(user._id, JSON.stringify(user), "EX", 604800); //7days
      res.status(200).json({
        success: true,
        accessToken,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
// get user credentials
export const getUserCredentials = catchAsyncError(
  async (req: RequestApi, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id || "";
      getUserById(userId, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface ISocialAuthBody {
  email: string;
  name: string;
  avatar: string;
}

//social auth
export const socialAuth = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, avatar } = req.body as ISocialAuthBody;
      const user = await userModel.findOne({ email: email });
      if (user) {
        sendToken(user, 200, res);
      } else {
        const newUser = await userModel.create({ name, email, avatar });
        sendToken(newUser, 200, res);
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// /update user information
interface IUpdateUserBody {
  name: string;
  email: string;
  age: number;
  sex: string;
  phoneNumber: string;
  alternativePhoneNumber: string;
  address: string;
  pincode: string;
  specificProblem: string;
}
export const updateUserInfo = catchAsyncError(
  async (req: RequestApi, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        email,
        age,
        sex,
        phoneNumber,
        alternativePhoneNumber,
        address,
        pincode,
        specificProblem,
      } = req.body as IUpdateUserBody;
      const userId = req.user?._id || "";
      const user = await userModel.findById(userId);
      // if (!user) {
      //   return next(new ErrorHandler("User not found", 400));
      // } dont need as it protected route
      if (email && user) {
        const isEmailExist = await userModel.findOne({ email: email });
        if (isEmailExist) {
          return next(new ErrorHandler("Email already exists", 400));
        }
        user.email = email;
      }
      if (name && user) {
        user.name = name;
      }

      if (age && user) {
        user.age = age;
      }

      if (sex && user) {
        user.sex = sex;
      }

      if (phoneNumber && user) {
        user.phoneNumber = phoneNumber;
      }

      if (alternativePhoneNumber && user) {
        user.alternativePhoneNumber = alternativePhoneNumber;
      }

      if (address && user) {
        user.address = address;
      }

      if (pincode && user) {
        user.pincode = pincode;
      }

      if (specificProblem && user) {
        user.specificProblem = specificProblem;
      }
      await user?.save();
      await redis.set(userId, JSON.stringify(user));
      res.status(200).json({
        success: true,
        message: "User information updated successfully",
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
//update user password
interface IUpdateUserPassword {
  oldPassword: string;
  newPassword: string;
}

export const updateUserPassword = catchAsyncError(
  async (req: RequestApi, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body as IUpdateUserPassword;
      if (!oldPassword || !newPassword) {
        return next(
          new ErrorHandler("Please enter old password and new password", 400)
        );
      }
      const user = await userModel.findById(req.user?._id).select("+password");
      if (user?.password === undefined) {
        return next(new ErrorHandler("Invalid user", 400));
      }
      const isPasswordMatch = await user?.comparePassword(oldPassword);
      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid old password", 400));
      }
      user.password = newPassword;
      await user.save();
      await redis.set(req.user?._id, JSON.stringify(user));
      res.status(201).json({
        success: true,
        message: "Password updated successfully",
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//update profile picture

// interface IUpdateProfilePicture {
//   avatar: string;
// }
// export const updateProfilePicture = catchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { avatar } = req.body;
//     const userId = req.user?._id || "";
//     const user = await userModel.findById(userId);

//     if(avatar && user){
//       //if user have avatar then call this here only signup user by mail , social auth dont come
//       if(user?.avatar?.public_id){
//         await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);
//         const myCloud = await cloudinary.v2.uploader.upload(avatar, {
//           folder: "avatars",
//           width: 150,

//         });
//         user.avatar = {
//           public_id: myCloud.public_id,
//           url: myCloud.secure_url,
//         }
//         }else {
//           const myCloud = await cloudinary.v2.uploader.upload(avatar, {
//             folder: "avatars",
//             width: 150,

//           });
//           user.avatar = {
//             public_id: myCloud.public_id,
//             url: myCloud.secure_url,
//           }

//         };
//       }
//     }
//     await user?.save();
//     await redis.set(userId, JSON.stringify(user));
//     res.status(201).json({success: true, message: "Profile picture updated successfully", user});
//   } catch (error: any) {
//     return next(new ErrorHandler(error.message, 400));
//   }
// });

// //apply as a doctor

// export const applyAsDoctor = catchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
//   try {
//     const userId = req.user?._id || "";
//     const user = await userModel.findById(userId);
//     if(!user){
//       return next(new ErrorHandler("User not found", 400));
//     }

//     res.status(201).json({success: true, message: "Applied as a doctor successfully", user});
//   } catch (error: any) {
//     return next(new ErrorHandler(error.message, 400));
//   }
// })

//get doctors by specialization
export const getDoctorBySpecialization = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { specialization } = req.params;
      getDoctorBySpecializationService(res, specialization);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//give review to doctor

export const userReview = catchAsyncError(
  async (req: RequestApi, res: Response, next: NextFunction) => {
    try {
      const reviewerUserId = req.user?._id || ""; // ID of the user writing the review
      const userIdToReview = req.params._id; // ID of the user to be reviewed
      const { rating, text } = req.body;
      if (!rating || !text) {
        return res.status(400).json({
          status: "error",
          message: "Rating and text are required for a review",
        });
      }
      const reviewerUserInfo = await getUserById2(reviewerUserId, res);

      if (!reviewerUserInfo) {
        return res.status(404).json({
          status: "error",
          message: "Reviewer user not found in Redis",
        });
      }

      const { _id: reviewerId, name: reviewerName } = reviewerUserInfo;

      // Fetch the user to be reviewed from the database
      const userToReview = await userModel.findById(userIdToReview);

      if (!userToReview) {
        return res.status(404).json({
          status: "error",
          message: "User to be reviewed not found in the database",
        });
      }

      userToReview.reviews.push({
        _id: reviewerId,
        reviewerName,
        rating,
        text,
      });

      await userToReview.save();

      res.status(201).json({
        status: "success",
        message: "Review added successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
