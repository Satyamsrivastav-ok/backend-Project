import {Router} from "express";
import {logoutUser, registerUser} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.js";
const router = Router()
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logoutUser)
router.root("/refresh-token").post(refreshAccessToken)
export default router