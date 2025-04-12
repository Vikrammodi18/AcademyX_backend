const ApiError = require("../utils/apiError.js")
const ApiResponse = require("../utils/apiResponse.js")
const asyncHandler = require("../utils/asyncHandler.js")
const User = require("../models/user.model.js")
const jwt = require("jsonwebtoken")
const uploadProfileImageOnCloudinary = require("../utils/cloudinary.js")
const {mongoose,isValidObjectId} = require("mongoose")

const options = {
    httpOnly:true,
    secure:true
}
const genereateRefreshAndAccessToken = async (userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(400,"error while generating access and refreshToken")
    }
}

const registerUser = asyncHandler(async (req,res)=>{
    //get username, email, password, 
    //validate username,email,password
    //check user already exist or not
    //register user
    const{username,email,password} = req.body;

    if([username,email,password].some((val)=> !val || val?.trim() === "")){
        throw new ApiError(400,"All Fields are required!")
    }
   if(!email.includes("@")){
    throw new ApiError(400,"@ is required in email")
   }
   const existedUser = await User.findOne({email})
   if(existedUser){
    throw new ApiError(403,"user already existed!!")
   }
   const user = await User.create({
    username,
    email,
    password
   })

   if(!user){
    throw new ApiError(500,"something went wrong while register user")
   }
   return res.status(200)
        .json(
            new ApiResponse(200,
                user,
                "user registered successfully"
            )
        )
})

const loginUser = asyncHandler(async (req,res)=>{
    //take email and password
    //validate email and password
    //check user registered or not
    //check password 
    //give access token and refresh token in cookies
    //user logged in
    //some iterator return true if atleast one condition is true
    const {email,password} = req.body
    if([email,password].some((field)=> !field || field.trim()==="")){
        throw new ApiError(400,"email or password can not be empty")
    }
    const user = await User.findOne({email})
    if(!user){
        throw new ApiError(404,"User must be registered!!")
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password)
    if(!isPasswordCorrect){
        throw new ApiError(404,"password is wrong")
    }
    const{refreshToken,accessToken} =await genereateRefreshAndAccessToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
  
    return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    loginUser:loggedInUser,
                    accessToken,
                    refreshToken
                },
                "user logged in"
            )
        )
})

const logoutUser = asyncHandler(async (req,res)=>{
    // console.log(req?.user)
    
    await User.findByIdAndUpdate(
        req?.user?._id,
        {
            $unset:{
                refreshToken:null
            }
        },
        {new:true}
    )
    // console.log("cookies:",req?.cookies)
    return res
    .status(200)
    .clearCookie("refreshToken",options)
    .clearCookie("accessToken",options)
    .json(
        new ApiResponse(
            200,
            {},
            "user logged out"
        )
    )
    
})
const uploadProfileImage = asyncHandler(async (req,res)=>{
   console.log(req.file?.path)
   if(!req.file?.path){
    throw new ApiError(400,"file path is required!")
   }
   const upload = await uploadProfileImageOnCloudinary(req.file?.path)
   if(!upload){
    throw new ApiError(500,"unable to update profile image")

   }
   console.log(upload.url)
   const user = await User.findById(req.user?._id)
   user.profileImage = upload.url
   user.save({validateBeforeSave:false})
   return res
   .status(200)
   .json(
    new ApiResponse(200,{},"profile image updated")
   )
})
const refreshAccessToken = asyncHandler(async (req,res)=>{
try {
     
        const token = req?.cookies?.refreshToken;
        if(!token){
            throw new ApiError(402,"unauthorised access")
        }
       
        const decoded = jwt.verify(token,process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decoded?._id)
        if(user.refreshToken !== token){
            throw new ApiError(500,"refreshToken expired")
        }
        const {accessToken,refreshToken} = await genereateRefreshAndAccessToken(user._id)
        
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(
            new ApiResponse(
                200,
                {user:user,
                    refreshToken,
                    accessToken,
                },
                "grant refresh and accessToken"
            )
        )
} catch (error) {
    throw new ApiError(500, error.message || "something went while generating refreshAccessToken")
}
})
const changePassword = asyncHandler(async (req,res)=>{
    
    const{newPassword,oldPassword} = req.body
    if(newPassword === oldPassword){
        throw new ApiError(403,"new password is equal to old password")
    }
    if(!newPassword || newPassword.trim()===""){
        throw new ApiError(400,"password required")
    }
    const user = await User.findById(req.user?._id)
    const checkPassword = await user.isPasswordCorrect(oldPassword)
    if(!checkPassword){
        throw new ApiError(400,"password is incorrect")
    }
    user.password = newPassword
    user.save({validateBeforeSave:false})
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"password successfully changed!!")
    )
    
})
module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    uploadProfileImage,
    refreshAccessToken,
    changePassword,
}