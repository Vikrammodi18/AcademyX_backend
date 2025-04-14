const Course = require("../models/course.model")
const Enrollment = require("../models/enrollment.model")

const ApiError = require("../utils/apiError")
const ApiResponse = require("../utils/apiResponse")
const asyncHandler = require("../utils/asyncHandler")
const {mongoose, isValidObjectId} = require("mongoose")



const toggleEnrollment = asyncHandler(async(req,res)=>{
    const{courseId} = req.params
    if(!isValidObjectId(courseId)){ 
            throw new ApiError(401,"Invalid course Id")
        }
    //checking course is present or not
    const course = await Course.findById(new mongoose.Types.ObjectId(courseId))
    if(!course){
        throw new ApiError(404,"Course not found")
    }

    //check student enrolled or not
    const isEnrolled = await Enrollment.findOne(
        {
            course:new mongoose.Types.ObjectId(courseId),
            student:req?.user._id

        }
    )
    if(isEnrolled){

        const unEnrolled = await Enrollment.findOneAndDelete(
            {
                course: new mongoose.Types.ObjectId(courseId),
                student: req?.user._id
            }
        )
        if(!unEnrolled){
            throw new ApiError(500,"unable to unenrolled!")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200,{},"Unenrolled successfully")
        )

    }else{
        const enroll = await Enrollment.create({
            course: new mongoose.Types.ObjectId(courseId),
            student: req?.user._id
        })
        if(!enroll){
            throw new ApiError(500,"unable to enroll right now")
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200,{},"Successfully enrolled ")
        )
    }
})

module.exports = {
    toggleEnrollment
}