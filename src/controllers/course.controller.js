const Course = require("../models/course.model");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/asyncHandler");
const {uploadProfileImageOnCloudinary} = require("../utils/cloudinary");
const {mongoose,isValidObjectId}= require("mongoose")

const createCourse = asyncHandler(async (req,res)=>{
    const{courseName,description,price,duration,category} = req.body
    if([courseName,description,price,duration,category].some((field)=> !field || field.trim()==="")){
        throw new ApiError(402,"courseName,description,price,duration,category are required")
    }
    if(price<0 || parseInt(price) < 0){
        throw new ApiError(400,"price cannot be negative or fraction")
    }
   const thumbnailPath = req.file?.path
  
   if(!thumbnailPath){
    throw new ApiError(400,"file path are required!")
   }
   const response = await uploadProfileImageOnCloudinary(thumbnailPath)
   
   if(!response){
    throw new ApiError(500,"unable to upload thumbnail!")
   }
    const course = await Course.create(
        {
            courseName:courseName.trim(),
            description:description.trim(),
            price:parseInt(price),
            thumbnail:response?.url,
            category:category.trim(),
            educator:req.user?._id,
            duration,
        }
)
    if(!course){
        throw new ApiError(500,"unable to create your course")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,course,"course successfully Created")
    )
})

const updateCourse = asyncHandler(async (req,res)=>{
    const{courseId} = req.params
    if(!isValidObjectId(courseId)){
        throw new ApiError(400,"enter valid Course Id")
    }
    const{courseName,description,price,duration,category} = req.body

    if([courseName,description,price,duration,category].some((field)=> !field || field.trim()==="")){
        throw new ApiError(400,"send valid data or fields cannot be empty")
    }
    if(price<0 || parseInt(price) < 0){
        throw new ApiError(400,"price cannot be negative or fraction")
    }
    const course = await Course.findById(new mongoose.Types.ObjectId(courseId))
    
    if(!course.educator.equals(req.user?._id)){
        throw new ApiError(403,`you are not owner of ${course.courseName} course`)
    }
    const updatedCourse = await Course.findByIdAndUpdate(new mongoose.Types.ObjectId(courseId),{
        $set:{
            courseName : courseName.trim(),
            description: description.trim(),
            price,
            duration:duration.trim(),
            category:category.trim()
        },
        
    },{new:true})
    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedCourse,"course updated successfully")
    )
})
const updateThumbnail = asyncHandler(async (req,res)=>{
    const{courseId} = req.params
    if(isValidObjectId(courseId)){
        throw new ApiError(400,"invalid course Id")
    }
    const filePath = req.file?.path
    //upload thumbnail on cloudinary
    const response = await uploadProfileImageOnCloudinary(filePath)
    if(!response.url){
        throw new ApiError(500,"unable to upload thumbnail")
    }
    const existedCourse = await Course.findById(new mongoose.Types.ObjectId(courseId))
    if(!existedCourse.educator.equals(req.user?._id)){
        throw new ApiError(402,"you are not owner of course")
    }
    const course = await Course.findByIdAndUpdate(
        new mongoose.Types.ObjectId(courseId),
        {
            $set:{
                thumbnail:response.url
            }
        },
        {new:true}
)
    return res
    .status(200)
    .json(
        new ApiResponse(200,course,"thumbnail updated successfully!!")
    )
})
const getAllCourse = asyncHandler(async (req,res)=>{
    
    const allCourses = await Course.aggregate([
            {
                $lookup: {
                  from: "users",
                  foreignField: "_id",
                  localField: "educator",
                  pipeline: [
                    {
                      $project: {
                        username: 1,
                        profileImage: 1,
                      },
                    },
                  ],
                  as: "educator",
                },
              },
              {
                $addFields: {
                  educator: {
                    $arrayElemAt: ["$educator", 0],
                  },
                },
              },
        
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            allCourses,
            "all courses"
        )
    )
})
const getCourseById = asyncHandler(async (req,res)=>{
    const{courseId} = req.params

    let course = await Course.findById(new mongoose.Types.ObjectId(courseId))
    .populate({
        path: "content", // Assuming 'content' in Course refers to lessons
        populate: {
            path: "video", // Populate videos inside lessons
            select: "videoTitle videoUrl" // Select only necessary fields
        }
    })
    .populate({
        path: "educator", // Populate educator details
        select: "-password -email -refreshToken" // Exclude sensitive fields
    });
    if(!course){
        throw new ApiError(502,"something went wrong while fetching courses")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,course,"successfully")
    )
})
module.exports = {
    createCourse,
    updateCourse,
    updateThumbnail,
    getAllCourse,
    getCourseById
}