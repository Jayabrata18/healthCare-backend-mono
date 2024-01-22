import mongoose, { Document, Model, Schema } from "mongoose";

export interface INotification extends Document {
  //   userId: string;
  //   title: string;
  //   description: string;
  //   read: boolean;
  title: string;
  message: string;
  status: string;
  createdAt: Date;
}
const notificationSchema = new Schema<INotification>(
  {
    //   userId: {
    //     type: String,
    //     required: true,
    //   },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);
const NotificationModel: Model<INotification> = mongoose.model(
  "Notification",
  notificationSchema
);
export default NotificationModel;
