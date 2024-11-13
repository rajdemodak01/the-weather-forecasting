import mongoose from "mongoose";

const connectDB= async()=>{
    try {
        const mongooseInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
        console.log(`\n Mongoose connected, DB host: ${mongooseInstance.connection.host}`)
    } catch (error) {
        console.log("MOngodb not connected ", error)
        process.exit(1)
    }
}

export default connectDB