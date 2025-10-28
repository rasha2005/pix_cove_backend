import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
      email: { type: String, required: true, unique: true },
      phone: { type: String , required: true,},
      password: { type: String, required: true }, 
      isVerified:{type: Boolean , required: true}
    },
    { timestamps: true }
  );
  
  const User = mongoose.model("User", UserSchema);
  export default User;