import mongoose from "mongoose";

export function isObjectId(value: string) {
  return mongoose.Types.ObjectId.isValid(value) && new mongoose.Types.ObjectId(value).toString() === value;
}

export function objectIdTime(value: string) {
  if (!isObjectId(value)) return 0;
  return new mongoose.Types.ObjectId(value).getTimestamp().getTime();
}
