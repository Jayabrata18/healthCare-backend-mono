import mongoose, { Schema, Document, Model, Types } from "mongoose";
require("dotenv").config();
import { IUser } from "./userModel";
import bcrypt from "bcryptjs";
require("dotenv").config();
import jwt from "jsonwebtoken";

const emailRegePattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
enum SpecialistType {
  Dentist = "Dentist",
  Cardiology = "Cardiology",
  Orthopedic = "Orthopedic",
  Neurology = "Neurology",
  Gastroenterology = "Gastroenterology",
  Otology = "Otology",
  Rhinology = "Rhinology",
  Urology = "Urology",
  Gynecology = "Gynecology",
  Pulmonology = "Pulmonology",
  Pediatrics = "Pediatrics",
  General = "General",
  ChildSpecialist = "ChildSpecialist",
}
export interface IChemberAddress {
  address: string;
  pincode: string;
  district: string;
  state: string;
}
export interface IDoctor extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  age: number;
  sex: string;
  specialist: SpecialistType;
  experience: number;
  education: string;
  phoneNumber: string;
  alternativePhoneNumber: string;
  chemberAddress: IChemberAddress[];
  comparePassword(password: string): Promise<boolean>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
  role: {
    type: String;
    // default: "doctor";
  };
  isVerified: boolean;
}

const doctorSchema: Schema<IDoctor> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      maxLength: [30, "Your name cannot exceed 30 characters"],
      minLength: [4, "Your name must be at least 4 characters long"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      validate: {
        validator: function (email: string): boolean {
          return emailRegePattern.test(email);
        },
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [5, "Your password must be longer than 6 characters"],
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
        // required: true,
      },
      url: {
        type: String,
        // required: true,
      },
    },
    age: {
      type: Number,
    },
    sex: {
      type: String,
    },
    phoneNumber: {
      type: String,
      validate: {
        validator: function (v: string) {
          return /\d{10}/.test(v);
        },
        message: (props: any) => `${props.value} is not a valid phone number!`,
      },
      // required: [true, "User phone number required"],
    },

    alternativePhoneNumber: {
      type: String,
      validate: {
        validator: function (v: string) {
          return /\d{10}/.test(v);
        },
        message: (props: any) => `${props.value} is not a valid phone number!`,
      },
      // required: [false, "User alternative phone number is not required"],
    },
    specialist: {
      type: String,
      enum: Object.values(SpecialistType),
    },
    experience: {
      type: Number,
    },
    chemberAddress: [
      {
        address: String,
        pincode: {
          type: String,
          validate: {
            validator: function (v: string) {
              return /\d{6}/.test(v);
            },
            message: (props: any) => `${props.value} is not a valid pincode!`,
          },
        },
        district: String,
        state: String,
      },
    ],

    role: {
      type: String,
      default: "doctor",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

//hash password
doctorSchema.pre<IDoctor>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//compare password
doctorSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

//sign access token
doctorSchema.methods.SignAccessToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.ACCESS_TOKEN || ("" as string),
    {
      expiresIn: "5m",
    }
  );
};
// sign refresh token
doctorSchema.methods.SignRefreshToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.REFRESH_TOKEN || ("" as string),
    {
      expiresIn: "3d",
    }
  );
};

const doctorModel: Model<IDoctor> = mongoose.model("Doctor", doctorSchema);

export default doctorModel;
