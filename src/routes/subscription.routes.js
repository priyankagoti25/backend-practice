import { Router } from "express";
import {
  subscribeChannel,
  unsubscribeChannel,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const subscriptionRoutes = Router();

//I am adding this line to check docpulse again with ngrok live url

subscriptionRoutes
  .route("/subscribe/:channelId")
  .post(verifyJWT, subscribeChannel);
subscriptionRoutes
  .route("/unsubscribe/:channelId")
  .post(verifyJWT, unsubscribeChannel);
export default subscriptionRoutes;
