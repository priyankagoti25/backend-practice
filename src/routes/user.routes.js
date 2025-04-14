import { Router } from "express"
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
} from "../controllers/user.controller.js";
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
userRoutes.route('/change-password').post(verifyJWT, changeCurrentPassword)
userRoutes.route('/current-user').get(verifyJWT, getCurrentUser)
userRoutes.route('/update-account').patch(verifyJWT, updateAccountDetails)
userRoutes.route('/update-avatar').patch(verifyJWT, upload.single('avatar'), updateUserAvatar)
userRoutes.route('/update-cover-image').patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage)
userRoutes.route('/channel/:username').get(verifyJWT, getUserChannelProfile)
userRoutes.route('/watch-history').get(verifyJWT, getWatchHistory)

export default userRoutes