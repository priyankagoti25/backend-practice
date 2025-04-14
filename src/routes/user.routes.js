import { Router } from "express"
import {loginUser, logoutUser, refreshAccessToken, registerUser} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const userRoutes = Router()

userRoutes.route('/register').post(upload.fields([
    {
        name:"avatar",
        length:1
    },
    {
        name:"coverImage",
        length:1
    }
]),registerUser)
userRoutes.route('/login').post(loginUser)

//secured routes
userRoutes.route('/logout').post(verifyJWT, logoutUser)
userRoutes.route('/refresh-token').post(refreshAccessToken)

export default userRoutes