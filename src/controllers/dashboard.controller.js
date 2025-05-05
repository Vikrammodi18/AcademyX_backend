const ApiError = require("../utils/apiError")
const asyncHandler = require("../utils/asyncHandler") 
const User = require("../models/user.model")
const mongoose = require("mongoose")
const Enrollment = require("../models/enrollment.model")
const ApiResponse = require("../utils/apiResponse")
const Course = require("../models/course.model")

const userEnrolledCourse = asyncHandler(async (req,res)=>{
    //student dashboard
    const userId = req?.user?._id
    if(!userId){
        throw ApiError(403,"user Id is required")
    }
    const enrolled = await Enrollment.findOne({student: userId})
    if(!enrolled){
        const user = await User.findById(new mongoose.Types.ObjectId(userId)).select("username profileImage email")

        return res
        .status(200)
        .json(
            new ApiResponse(200,[user],"you have not any courses")
        )
        
    }
    const enrolledCourse = await User.aggregate([
        {
           $match:{
            _id: new mongoose.Types.ObjectId(userId) 
           }
        },
        {
            $lookup:{
                from:"enrollments",
                localField:"_id",
                foreignField:"student",
                as:"courseId"
            }
        },
       {
        $addFields:{
            courseIds:{
                $map:{
                    input:"$courseId",
                    as:"enroll",
                    in:"$$enroll.course"
                }
            }
        }
       },
       {
        $lookup:{
            from:"courses",
            localField:"courseIds",
            foreignField:"_id",
            as:"courses"
        }
       },
       {
        $project:{
            username:1,
            email:1,
            profileImage:1,
            courses:1,
        }
       }
       
    ])
    return res
    .status(200)
    .json(
        new ApiResponse(200,enrolledCourse,"all data fetched with enrollement")
    )

})

//educator dashboard
const educatorDashboard = asyncHandler(async(req,res)=>{
    
    const userId = req?.user?._id
    if(!userId){
        throw new ApiError(403,"user is not logged In")
    }

    const course = await Course.find({
        educator: new mongoose.Types.ObjectId(userId)
    }).select("-educator -content")
   
    return res
    .status(200)
    .json(
        new ApiResponse(200,course,course.length?"your all course fetched sucessfully":"No course found for this educator.")
    )
    
})

module.exports = {
    userEnrolledCourse,
    educatorDashboard
}
