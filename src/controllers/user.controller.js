import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadCloudinary} from "../utils/cloudinary.js";
import {AoiResponse} from "../utils/ApiResponse.js";
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
export {registerUser}