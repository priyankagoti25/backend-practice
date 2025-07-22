import {Router} from "express";
import {uploadVideo, getVideosList, increaseViews, updateVideo, publishVideo} from "../controllers/video.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
const videoRoutes = Router()

videoRoutes.route('/upload').post(
    verifyJWT,
    upload.fields([
    {name: 'videoFile', length:1},
    {name: 'thumbnail', length:1}
]),uploadVideo)

videoRoutes.route('/update/:id').patch(
    verifyJWT,
    upload.fields([
        {name: 'videoFile', length:1},
        {name: 'thumbnail', length:1}
    ]),updateVideo)

videoRoutes.route('/publish/:id').get(verifyJWT,publishVideo)
videoRoutes.route('/list').get(getVideosList)
videoRoutes.route('/increase-views/:id').post(increaseViews)

export default videoRoutes