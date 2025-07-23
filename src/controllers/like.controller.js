import {asyncHandler} from "../utils/asyncHandler.js";
import {Like} from "../models/like.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {Video} from "../models/video.model.js";

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
            const payload = {
                video: req.body.videoId,
                videoLikedBy:  req.user._id
            }
            const newVideoLike = new Like(payload)
            await newVideoLike.save()
            const existingVideo = await Video.findById(req.body.videoId)
            if(existingVideo?.likesCount){
                existingVideo.likesCount += 1
            } else {
                existingVideo.likesCount = 1
            }
            await existingVideo.save()
            const createdLike = await Like.findById(newVideoLike._id)
            return res.status(200).json(new ApiResponse(200, "Video is liked", createdLike))
        }
    }
})

export {addOrRemoveLikes}