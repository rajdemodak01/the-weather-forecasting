import { Router } from "express";
import { registerUser, sendOtp, verifyOtp } from "../controllers/user.controller.js";

const router=Router()

router.route("/register").post(registerUser)
router.route("/sendOtp").post(sendOtp)
router.route("/verifyOtp").post(verifyOtp)

export default router