const {Router} = require("express")
const { verifyJWT } = require("../middleware/auth.middleware")
const { userEnrolledCourse } = require("../controllers/dashboard.controller")
const router = Router()

router.route("/").get(verifyJWT,userEnrolledCourse)

module.exports = router
