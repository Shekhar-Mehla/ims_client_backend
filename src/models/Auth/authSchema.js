import mongoose from "mongoose";

const AuthSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String },
    providers: [{ provider: String, providerId: String }],
    verified: { type: Boolean, default: false },
    refreshToken: { type: String },
    usertype: { type: [String], default: ["user"] },
  },
  { timestamps: true }
);

const authCollection = mongoose.model("Auth", AuthSchema);
export default authCollection;

