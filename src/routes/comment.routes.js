import {Router} from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import {addComment, updateComment, getComments, deleteComment} from "../controllers/comment.controller.js"

const commentRoutes = Router()
commentRoutes.route('/create/:videoId').post(verifyJWT, addComment)
commentRoutes.route('/update/:id').post(verifyJWT, updateComment)
commentRoutes.route('/list/:videoId').get(verifyJWT, getComments)
commentRoutes.route('/delete/:id').delete(verifyJWT, deleteComment)

export default commentRoutes