import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
const generateAccessAndRefreshTokens = async(userId) => 
    {
    try{
       const user = await User.findbyId(userId)
      const accessToken=  user.generateAccessToken()
       const refreshToken = user.generateRefreshToken()
       user.refreshToken =refreshToken
       await user.save({validateBeforeSave: false})
       return {accessToken,refreshToken}
    }catch(error){
        throw new ApiError(500,"Something went wrong while generating Access and Refresh tokens")
    }
}
const registerUser = asyncHandler(async (req, res) => {
const {fullName, email, username, password} = req.body;
if(
    [fullName, email, username, password].some((field) => field?.trim() ==="")
){
    throw new ApiError("All fields are required", 400);

}
const existedUser = User.findOne({
    $or: [{email}, {username}]  
});
if(existedUser){
    throw new ApiError("User with this email or username already exists", 409);
}
console.log("Registration request:", {fullName, email, username});

const avatarLocalPath = req.file ? req.file.avatar[0]?.path : null;
const coverImageLocalPath = req.file ? req.file.coverImage[0]?.path : null;
if(!avatarLocalPath){
    throw new ApiError("Avatar image is required", 400);
}
 const avatar = uploadOnCloudinary(avatarLocalPath)
 const coverImage= await uploadOnCloudinary(coverImageLocalPath)
 if(!avatar){
    throw new ApiError("Failed to upload avatar image", 400);
 }
 User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage.url,
    email,
    username:username.tolowerCase(),
    password

 })
const user = await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
 })
 const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
 )
 if(!createdUser){
    throw new ApiError("Failed to create user", 500);
 }
 return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully"));

})
const loginUser =asyncHandler(async (req,rest) =>{
    const {email, username,password} = req.body;
    if(!username || !email){
        throw new ApiError(400,"username or email is required");
    }
    const user = await User.findOne({
        $or: [{username},{email}]
    })
    if(!user){
        throw new ApiError(404,"User does not exist")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Password Incorrect")
    }
    const {accessToken,refreshToken}= await generateAccessAndRefreshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly : true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
            user: loggedInUser,accessToken,refreshToken
            },
            "User logged in Successfully"
        )
    )
})
const logoutUser = asyncHandler(async(req,res)=>{
 User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            refreshToken = undefined
        }
    },
    {
        new : true
    }
 )
 const options = {
    httpOnly : true,
    secure : true
 }
 return res
 .status(200)
 .clearCookie("accessToken",options)
 .clearCookie("refreshToken",options)
 .json(new ApiResponse(200,{},"User logged Out"))
})
const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }
   try{
   const decodedToken =  jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )
    const user=await User.findById(decodedToken?._id)
    if(!user){
        throw new ApiError(401,"Invalid refresh token")
    }
    if(incomingRefreshToken!==user?.refreshToken){
        throw new ApiError(401,"Refresh token is expired or used")

    }
    const options = {
        httpOnly: true,
        secure:true
    }
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
        new ApiResponse(
            200,
            {accessToken,refreshToken : newrefreshToken},"Access Token refreshed"
        )
    )
}catch(error){
    throw new ApiError(401,error?.message || "Invalid Refresh Token")
}
}) 
export {registerUser,loginUser,logoutUser,refreshAccessToken}