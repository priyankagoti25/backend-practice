import {asyncHandler} from "../utils/asyncHandler.js";
import {Like} from "../models/like.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {Video} from "../models/video.model.js";
import {Comment} from "../models/comment.model.js";
import {Tweet} from "../models/tweet.model.js";
import {ApiError} from "../utils/ApiError.js";

const addOrRemoveLikes = asyncHandler(async (req, res)=>{
    if(req.body.videoId){
        const existingVideoLike = await Like.findOne({video: req.body.videoId, videoLikedBy: req.user._id})
        if (existingVideoLike){
            await Like.deleteOne(existingVideoLike._id)
            const existingVideo = await Video.findById(req.body.videoId)
            if(existingVideo?.likesCount){
                existingVideo.likesCount -= 1
            }
            await existingVideo.save()
            return res.status(200).json(new ApiResponse(200, "Video is disliked", existingVideoLike))
        } else {
            const existingVideo = await Video.findById(req.body.videoId)
            if(!existingVideo){
                throw new ApiError(400, "This kind of video is not available")
            }
            const payload = {
                video: req.body.videoId,
                videoLikedBy:  req.user._id
            }
            const newVideoLike = new Like(payload)
            await newVideoLike.save()
            if(existingVideo?.likesCount){
                existingVideo.likesCount += 1
            } else {
                existingVideo.likesCount = 1
            }
            await existingVideo.save()
            const createdLike = await Like.findById(newVideoLike._id)
            return res.status(200).json(new ApiResponse(200, "Video is liked", createdLike))
        }
    } else if(req.body.commentId){
        const existingCommentLike = await Like.findOne({comment: req.body.commentId, commentLikedBy: req.user._id})
        if (existingCommentLike){
            await Like.deleteOne(existingCommentLike._id)
            const existingComment = await Comment.findById(req.body.commentId)
            if(existingComment?.likesCount){
                existingComment.likesCount -= 1
            }
            await existingComment.save()
            return res.status(200).json(new ApiResponse(200, "Comment is disliked", existingCommentLike))
        } else {
            const existingComment = await Comment.findById(req.body.commentId)
            if(!existingComment){
                throw new ApiError(400, "This kind of comment is not available")
            }
            const payload = {
                comment: req.body.commentId,
                commentLikedBy:  req.user._id
            }
            const newCommentLike = new Like(payload)
            await newCommentLike.save()
            if(existingComment?.likesCount){
                existingComment.likesCount += 1
            } else {
                existingComment.likesCount = 1
            }
            await existingComment.save()
            const createdLike = await Like.findById(newCommentLike._id)
            return res.status(200).json(new ApiResponse(200, "Comment is liked", createdLike))
        }
    } else if(req.body.tweetId){
        const existingTweetLike = await Like.findOne({tweet: req.body.tweetId, tweetLikedBy: req.user._id})
        if (existingTweetLike){
            await Like.deleteOne(existingTweetLike._id)
            const existingTweet = await Tweet.findById(req.body.tweetId)
            if(existingTweet?.likesCount){
                existingTweet.likesCount -= 1
            }
            await existingTweet.save()
            return res.status(200).json(new ApiResponse(200, "Tweet is disliked", existingTweetLike))
        } else {
            const existingTweet = await Tweet.findById(req.body.tweetId)
            if(!existingTweet){
                throw new ApiError(400, "This kind of tweet is not available")
            }
            const payload = {
                tweet: req.body.tweetId,
                tweetLikedBy:  req.user._id
            }
            const newTweetLike = new Like(payload)
            await newTweetLike.save()
            if(existingTweet?.likesCount){
                existingTweet.likesCount += 1
            } else {
                existingTweet.likesCount = 1
            }
            await existingTweet.save()
            const createdLike = await Like.findById(newTweetLike._id)
            return res.status(200).json(new ApiResponse(200, "Tweet is liked", createdLike))
        }
    }
})

export {addOrRemoveLikes}