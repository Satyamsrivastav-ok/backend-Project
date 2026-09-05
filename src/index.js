import dotenv from "dotenv";
import connectDB from "./db/index.js";
dotenv.config({
path:'./env'
});
connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(
                `Server is running on port ${process.env.PORT || 8000}`
            );
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    });





/*import express from "express"
const app=express()



function connectDB() {}

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`, ) 
    app.on("error", (error) => {
      console.error("Error: ", err);
      throw error
    }) 
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    })   
  }
  catch(error){
    console.error("Error: ",error)

  })()
    */