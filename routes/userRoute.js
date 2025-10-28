import express from "express";
const userRouter = express();
import { registerUser ,loginUser , saveImages , getAllImages,getImageById,deleteImageById,editImageById,resetUserPasswor,verifyEmail} from "../controller/userController.js";
import Auth from "../service/auth.js";

userRouter.post('/register' , registerUser );
userRouter.post('/login' , loginUser );
userRouter.post('/uploadImages' ,Auth, saveImages );
userRouter.get('/getImages' , getAllImages );
userRouter.get('/userImages' ,Auth, getImageById );
userRouter.delete('/deleteImage' ,Auth, deleteImageById );
userRouter.put('/editImage' ,Auth, editImageById );
userRouter.put('/passwordReset' ,Auth, resetUserPasswor );
userRouter.get('/verify-email', verifyEmail);




export default userRouter;