import { User } from "../model/user.model.js";
import { OTP } from "../model/otp.model.js";
import sgMail from "@sendgrid/mail"
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

  const createdUser = await User.findById(user._id).select("-password");
  if (!createdUser) {
    throw new Error("Error while creating user");
  }

  return res.status(200).json(createdUser);
};
const loginUser= async(req, res)=>{
  const {email, password} = req.body;
  if (!email || !password) {
    throw new Error("Username and password is required to login");
  }
  const user = await User.findOne( {email});
  if(!user){
    throw new Error("user not exist")
  }
  const isPasswordValid= await user.isPasswordValid(password);
  if(!isPasswordValid){
    throw new Error("Password is invalid");
  }
  return res
  .status(200)
  .json(user)
}

const logoutUser = async (req, res)=>{
  
}

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new Error("Email is required");
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    await OTP.deleteMany({email})
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
  
  await OTP.deleteMany({email})
  return res.status(200).json({ message: "otp matched successfully" });
};

export { registerUser, verifyOtp, sendOtp };
