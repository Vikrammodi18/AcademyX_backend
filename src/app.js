const express = require("express")
const app = express()
const cors = require("cors")
const cookieParser = require("cookie-parser")
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(cookieParser())


const userRouter = require("./routes/user.route.js")
const courseRouter = require("./routes/course.route.js")
const lessonRouter = require("./routes/lesson.route.js")
app.use("/api/v1/users",userRouter)
app.use("/api/v1/courses",courseRouter)
app.use("/api/v1/lessons",lessonRouter)
module.exports = app