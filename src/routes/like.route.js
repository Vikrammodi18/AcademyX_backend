const {Router} = require("express")
const router = Router()
const { toggleLike } = require("../controllers/like.controller.js")
const {verifyJWT} = require("../middleware/auth.middleware.js")

router.route("/:couseId/toggleLike").get(verifyJWT,toggleLike)


module.exports = router