const ApiError = require("../utils/apiError")
const asyncHandler = require("../utils/asyncHandler") 
const User = require("../models/user.model")
const mongoose = require("mongoose")
const Enrollment = require("../models/enrollment.model")
const userEnrolledCourse = asyncHandler(async (req,res)=>{
    //student dashboard
    const userId = req?.user?._id
    if(!userId){
        throw ApiError(403,"user Id is required")
    }
    const enrolled = await Enrollment.findOne({student: userId})
    if(!enrolled){
        throw new ApiError(404,"user did not enrolled any course")
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
            courses:1,
        }
       }
       
    ])
    res.send(enrolledCourse)

})

module.exports = {
    userEnrolledCourse
}