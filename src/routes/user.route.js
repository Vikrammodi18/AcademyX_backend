const {Router} = require('express')
const upload = require('../middleware/multer.middleware.js')
const router = Router()
const {
    registerUser,
    loginUser,
    logoutUser,
    uploadProfileImage,
    refreshAccessToken,
    changePassword
} = require("../controllers/user.controller.js")
const { verifyJWT } = require('../middleware/auth.middleware.js')

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").get(verifyJWT,logoutUser)
router.route("/updateProfileImage").post(verifyJWT,upload.single("profileImage"),uploadProfileImage)
router.route("/refreshAccessToken").get(refreshAccessToken)
router.route("/changePassword").post(verifyJWT,changePassword)

module.exports = router