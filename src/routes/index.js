import { Router } from "express";
import userRoutes from "./user.routes.js";
import videoRoutes from "./video.routes.js";
import commentRoutes from "./comment.routes.js";
import tweetRoutes from "./tweet.routes.js";
const router = Router()

router.use('/users', userRoutes)
router.use('/videos', videoRoutes)
router.use('/comments', commentRoutes)
router.use('/tweets', tweetRoutes)

export default router