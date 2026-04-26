import express from "express";
import { getCars, getUserData, loginUser, registerUser,sendOtp,resetPassword } from "../controllers/userController.js";
import { getMlHealth, predictPrice } from "../controllers/mlController.js";
import { protect } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/data', protect, getUserData)
userRouter.get('/cars', getCars)
userRouter.get('/ml-health', getMlHealth)
userRouter.post('/predict-price', protect, predictPrice)
userRouter.post("/send-otp", sendOtp);         
userRouter.post("/reset-password", resetPassword); 


export default userRouter;
