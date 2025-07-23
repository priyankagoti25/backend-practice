import {asyncHandler} from "../utils/asyncHandler.js";
import {Tweet} from "../models/tweet.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const addTweet = asyncHandler(async (req, res)=> {
    if(!req.body.content){
        throw new ApiError(400,"Add tweet content")
    }
    const payload = {
        ...req.body,
        sender: req.user._id,
        receiver: req.params.receiverId
    }
    const newTweet = new Tweet(payload)
    await newTweet.save()
    const createdTweet = await Tweet.findById(newTweet._id)
    return res.status(201).json(new ApiResponse(201, "Tweet added successfully", createdTweet))
})

const updateTweet = asyncHandler(async (req, res)=> {
    const tweet = await Tweet.findById(req.params.id)
    if(!tweet){
        throw new ApiError(400, "Tweet is not available")
    }
    if(!tweet.sender.equals(req.user._id)){
        throw new ApiError(403, "You are not allowed to update this tweet")
    }
    if(req.body.content){
        tweet.content = req.body.content
    }
    await tweet.save()
    const updatedTweet = await Tweet.findById(tweet._id)
    return res.status(200).json(new ApiResponse(200, "Tweet updated successfully", updatedTweet))
})

const getTweetsList = asyncHandler(async (req, res)=> {
    const tweets = await Tweet.aggregate([
        {
            $match: {receiver: new mongoose.Types.ObjectId(req.user._id)}
        },
        {
            $lookup:{
                from: "users",
                localField: "sender",
                foreignField: "_id",
                as: "sender",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            avatar: 1,
                            createdAt: 1,
                            updatedAt: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                "sender": { $first:"$sender"}
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, "Tweets List", tweets))
})

const deleteTweet = asyncHandler(async (req, res)=> {
    const tweet = await Tweet.findById(req.params.id)
    if(!tweet){
        throw new ApiError(400, "Tweet is not available")
    }
    if(!tweet.sender.equals(req.user._id)){
        throw new ApiError(403, "You are not allowed to delete this tweet")
    }
    await Tweet.deleteOne(tweet._id)
    return res.status(200).json(new ApiResponse(200, "Tweet deleted successfully", tweet))
})
export {addTweet, updateTweet, getTweetsList, deleteTweet}