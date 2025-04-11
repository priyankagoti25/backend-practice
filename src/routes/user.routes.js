import { Router } from "express"
import {registerUser} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

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

export default userRoutes