import { Router } from "express";
import userRoutes from "./user.routes.js";
import videoRoutes from "./video.routes.js";
const router = Router()

router.use('/users', userRoutes)
router.use('/videos', videoRoutes)

export default router