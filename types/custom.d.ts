import * as express from "express";
import { Request } from "express";
import { IUser } from "../models/userModel";
import { IDoctor } from "../models/doctorModel";
declare global {
  namespace Express {
    export interface RequestApi {
      user?: Record<string, any>;
    }
  }
}

export interface RequestApi extends Request {
  user?: Record<string, any>;
}

