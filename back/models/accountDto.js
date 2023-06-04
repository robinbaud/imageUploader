import { Schema } from "mongoose";

export const AccountDto = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});
