import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema(
    {
      userId: { type: String, required: true},
      url: { type: String , required: true,},
      title: { type: String, required: true }, 
    },
    { timestamps: true }
  );
  
  const Image = mongoose.model("Image", ImageSchema);
  export default Image;