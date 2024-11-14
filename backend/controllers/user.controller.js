import { User } from "../model/user.model.js";
import { OTP } from "../model/otp.model.js";
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch {
    throw new Error(
      "Something went wrong, while generating access and refresh token"
    );
  }
};

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const registerUser = async (req, res) => {
  const { email, password, username } = req.body;

  if ([email, username, password].some((field) => field?.trim() === "")) {
    throw new Error("All fields are required");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new Error("user already present");
  }

  const user = await User.create({
    email,
    password,
    username,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new Error("Error while creating user");
  }

  return res.status(200).json(createdUser);
};
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new Error("Username and password is required to login");
  }
  const user = await User.findOne({ email });
  if (!user) {
    // throw new Error("user not exist");
    console.log("user not exist")
    return res
    .status(401)
    .json("User not exist")
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    // throw new Error("Password is invalid");
    console.log("invalid password")
    return res
    .status(401)
    .json("invalid password")
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
console.log("login successful");
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({ user: loggedInUser, accessToken, refreshToken });
};

const logoutUser = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json("User logged out");
};

const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
  if(!incomingRefreshToken){
    throw new Error("unauthorized request")
  }
  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  )
  const user = await User.findById(decodedToken?._id)
  if(!user){
    throw new Error("Invalid refresh Token")
  }

  if(incomingRefreshToken !== user?.refreshToken){
    throw new Error( "Refresh token is expired or used")
  }

  try {
    const options={
      httpOnly:true,
      secure:true
    }
  
    const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id)
  
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        {
          accessToken,
          refreshToken : newRefreshToken,
        }
    )
  } catch (error) {
    throw new Error(error?.message || "Invalid refresh token")
  }
};

const getCurrentUser= async(req, res)=>{
  if(!req.user){
    return res
    .status(400)
    .json("User not authorized")
  }
  return res
  .status(200)
  .json(
    req.user
  )
}

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new Error("Email is required");
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    await OTP.deleteMany({ email });
    const createdOTP = await OTP.create({
      email,
      otp,
      expiresAt,
    });
    if (!createdOTP) {
      throw new Error("Error while storing otp inside mongodb");
    } else {
      console.log("otp stored successfully");
    }

    const msg = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: "Your OTP for the-weather-forecasting",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
      // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log(`Email sent from ${process.env.EMAIL_USER} to ${email}`);
      })
      .catch((error) => {
        console.error(error);
      });
    return res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!(email && otp)) {
    return res
      .status(400)
      .json({ message: "Both email and OTP are required for verification" });
  }
  const otpDocument = await OTP.findOne({ email });
  if (!otpDocument) {
    return res.status(400).json({ message: "OTP not found for this email" });
  }
  if (otpDocument.expiresAt < Date.now()) {
    return res.status(400).json({ message: "OTP has expired" });
  }

  // Compare OTP
  if (otpDocument.otp !== otp) {
    return res.status(400).json({ message: "Wrong OTP" });
  }

  await OTP.deleteMany({ email });
  return res.status(200).json({ message: "otp matched successfully" });
};

export { 
  registerUser, 
  verifyOtp, 
  sendOtp, 
  loginUser, 
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
};
