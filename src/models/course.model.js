const {mongoose,Schema} = require("mongoose")

const courseSchema = new Schema({
    courseName:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    duration:{
        type:String
    },
    price:{
        type:Number,
        default:0,
        min:[0,"price cannot be negative"],
        required:true
    },
    thumbnail:{
        type:String,
    },
    category:{
        type:String,
        trim:true,
        lowercase:true
    },
    educator:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    content:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Lesson"
    }]
},{timestamps:true})

const Course = mongoose.model("Course",courseSchema)
module.exports = Course