import {Router} from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import {addOrRemoveLikes} from "../controllers/like.controller.js";

const likeRoutes = Router()

likeRoutes.route("/add-remove").post(verifyJWT, addOrRemoveLikes)
export default likeRoutes