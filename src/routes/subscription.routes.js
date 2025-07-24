import {Router} from "express";
import {subscribeChannel} from "../controllers/subscription.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const subscriptionRoutes = Router()

subscriptionRoutes.route('/subscribe/:channelId').post(verifyJWT,subscribeChannel)
export default subscriptionRoutes