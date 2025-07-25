import {Router} from "express";
import {subscribeChannel, unsubscribeChannel} from "../controllers/subscription.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const subscriptionRoutes = Router()

subscriptionRoutes.route('/subscribe/:channelId').post(verifyJWT,subscribeChannel)
subscriptionRoutes.route('/unsubscribe/:channelId').post(verifyJWT,unsubscribeChannel)
export default subscriptionRoutes