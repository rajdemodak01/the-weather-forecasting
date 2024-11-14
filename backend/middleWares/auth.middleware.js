import jwt from "jsonwebtoken"
import { User } from "../model/user.model.js";

export const verifyJWT  = async(req, _, next)=>{
    try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        // console.log(`${token}`)
        if(!token){
            throw new Error(401, "Unauthorized request")
        }
        
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {   
            //discuss about frontend
            throw new Error("Invalid Access Token")
        }
        req.user = user;
        next()
    }catch(error){
        console.log("Error inside verifyJWT")
        // throw new ApiError(401, error?.message || "Invalid Access Token")
    }   
}