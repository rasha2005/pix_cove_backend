import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import Image from "../models/Images.js";


export const registerUser = async (req, res) => {
  try {
    const data = req.body.data;
    const {email, phone, password } = data
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password,10);

    const user = new User({
      email,
      phone,
      password: hashedPassword,
      isVerifed: false
    });

    const savedUser = await user.save();

    const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET, { expiresIn: "5m" });

    const verifyLink = `${process.env.FRONT_URL}/verify-email?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,  
        pass: process.env.PASSWORD 
      },
    });

    await transporter.sendMail({
      to: email,
      subject: "Verify your Email",
      html: `Click the link to verify your account: <a href="${verifyLink}">Verify Email</a>`,
    });

    res.status(201).json({ message: "User registered successfully", userId: savedUser._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const token = req.query.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
   const user= await User.findByIdAndUpdate({_id:decoded.userId}, { isVerified: true });
   if(user){

     const authtoken = jwt.sign(
       { id: user._id, email: user.email }, 
       process.env.JWT_SECRET,  
       { expiresIn:process.env.EXPIRES_IN}             
     );
     const isProduction = process.env.NODE_ENV === "production"
 
     res.cookie("authToken", authtoken, {
       path: '/', 
       secure: true, 
       sameSite: isProduction ?'none' : 'lax',
       domain:process.env.FRONT_URL
      })
      res.status(200).json({ success: true, message: "Email verified successfully!" })
  }

  } catch (error) {
    res.status(200).json({success:false, message: "Invalid or expired token" });
  }
};


export const loginUser = async (req, res) => {
    try {
      const data = req.body.data;
      const { email, password } = data;
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(200).json({success:true, message: "Invalid email or password" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(200).json({success:false, message: "Invalid email or password" });
      }
      if (!user.isVerified) {
        return res.status(200).json({
          success: false,
          message: "Please verify your email before logging in."
        });
      }
      const token = jwt.sign(
        { id: user._id, email: user.email }, 
        process.env.JWT_SECRET,  
        { expiresIn:process.env.EXPIRES_IN}             
      );
      const isProduction = process.env.NODE_ENV === "production"

      res.cookie("authToken", token, {
        path: '/', 
        secure: true, 
        sameSite: isProduction ?'none' : 'lax',
        domain:process.env.FRONT_URL
      });
  
      res.status(200).json({
        success:true,
        message: "Login successful",
        user: {
          email: user.email,
        },
        
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  export const saveImages = async (req, res) => {
    try {
      const data = req.body.data; 
      const user = req.user;

      const saved = await Image.insertMany(
        data.map(img => ({
          userId:user.id,
          url: img.url,
          title: img.title,
        }))
      );
  
      return res.status(201).json({ success: true,message:"Image saved successfully!"});
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  export const getAllImages = async (req, res) => {
    try {
      const images = await Image.find().sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        data: images
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  export const getImageById = async (req, res) => {
    try {
      const user = req.user;
  
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 8;  
  
      const skip = (page - 1) * limit;
  
      const images = await Image.find({ userId: user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

  
      const totalImages = await Image.countDocuments({ userId: user.id });
  
      res.status(200).json({
        success: true,
        data: {
          images,
          totalPages: Math.ceil(totalImages / limit),
          currentPage: page,
          totalImages
        },
      });
  
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  export const deleteImageById = async (req, res) => {
    try {
      const image_id = req.query.imgId;

     if(image_id){
      await Image.deleteOne({_id:image_id});
      return res.status(201).json({ success: true,message:"Image deleted successfully!"});

     }
  
      return res.status(201).json({ success: false,message:"Something went wrong!"});
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  
  export const editImageById = async (req, res) => {
    try {
      const { imgId , title, img_url } = req.body; 
  
      if (!imgId || !title || !img_url) {
        return res.status(400).json({
          success: false,
          message: "imgId, title and imgUrl are required",
        });
      }
  
      console
      
      const updatedImage = await Image.findByIdAndUpdate(
        imgId,
        { title, url: img_url }, 
        { new: true } 
      );
  
      if (!updatedImage) {
        return res.status(404).json({
          success: false,
          message: "Image not found",
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Image updated successfully",
        data: updatedImage,
      });
  
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  };

  export const resetUserPasswor = async(req ,res) => {
    try {
    const userId = req.user.id; 
    const { current, confirm } = req.body;

    if (!current || !confirm) {
      return res.status(200).json({ success: false, message: "All fields are required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(200).json({ success: false, message: "User not found." });
    }

    const isMatch = await bcrypt.compare(current, user.password);
    if (!isMatch) {
      return res.status(200).json({ success: false, message: "Current password is incorrect." });
    }

    const hashed = await bcrypt.hash(confirm, 10);

    // Update password
    user.password = hashed;
    await user.save();

    return res.status(200).json({ success: true, message: "Password updated successfully." });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
  }
  
