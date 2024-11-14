import { Router } from "express";
import { loginUser, registerUser, sendOtp, verifyOtp, refreshAccessToken, getCurrentUser, logoutUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleWares/auth.middleware.js";

const router=Router()

router.route("/register").post(registerUser)
router.route("/sendOtp").post(sendOtp)
router.route("/verifyOtp").post(verifyOtp)
router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/logout").post(verifyJWT, logoutUser)

export default router