import express from "express"
import cors from "cors"
import userRouter from "./routes/user.route.js"
import cookieParser from "cookie-parser"

const app=express()
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
    
app.use(express.json());
app.use(cookieParser())

// app.use("/", (req, res) => {
//     res.send("hello world from app");
// });
app.use("/auth", userRouter);

export {app}
