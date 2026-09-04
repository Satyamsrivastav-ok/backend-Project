import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

console.log("MONGODB_URI =", process.env.MONGODB_URI);
const connectDB = async () => {
    try{
        const connection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB connected: ${connection.connection.host}`);
        console.log(`\n MongoDB connected: ${connection.connection.host}`);
    }catch(error){
        console.error("Error: ",error);
        process.exit(1);
    }
}
export default connectDB;
