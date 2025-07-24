import {Router} from "express";
import {addTweet, updateTweet, getTweetsList, deleteTweet} from "../controllers/tweet.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const tweetRoutes = Router()

tweetRoutes.route("/create/:receiverId").post(verifyJWT, addTweet)
tweetRoutes.route("/update/:id").patch(verifyJWT, updateTweet)
tweetRoutes.route("/list").get(verifyJWT, getTweetsList)
tweetRoutes.route("/delete/:id").delete(verifyJWT, deleteTweet)

export default tweetRoutes