const Router = require("express")
const { verifyJWT } = require("../middleware/auth.middleware")

const router = Router()
const{toggleEnrollment} = require("../controllers/enrollment.controller")
router.route("/:courseId").get(verifyJWT,toggleEnrollment)

module.exports = router