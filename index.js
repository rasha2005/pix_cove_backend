import express from "express";
import dotenv from "dotenv"
import mongoose from "mongoose";
import cors from "cors";
import userRouter from "./routes/userRoute.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());

dotenv.config();

app.use(cors({
  origin: process.env.FRONT_URL, 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());


const MONGO_URI = process.env.MONGO_URL ;
mongoose.connect(MONGO_URI)
.then(() => console.log("db is connected"))
.catch((err) => console.log(err))


app.use("/api/user", userRouter);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));