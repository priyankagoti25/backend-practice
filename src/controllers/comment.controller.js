import {asyncHandler} from "../utils/asyncHandler.js";
import {Video} from "../models/video.model.js";
import {ApiError} from "../utils/ApiError.js";
import {Comment} from "../models/comment.model.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import mongoose from "mongoose";
const addComment = asyncHandler(async (req, res)=>{
    const video = await Video.findById(req.params.videoId)
    if(!video){
        throw new ApiError(400,"This video is not available")
    }
    const payload = {
        ...req.body,
        video: req.params.videoId,
        owner: req.user._id
    }
    const newComment = new Comment(payload)

    const validationError = newComment.validateSync()
    if(validationError) {
        return res.status(400).json(validationError)
    }
    await newComment.save()
    const createdComment = await Comment.findById(newComment._id)
    return res.status(201).json(new ApiResponse(201,"Comment added successfully", createdComment))
})

const updateComment = asyncHandler(async (req, res)=>{
    const comment = await Comment.findById(req.params.id)
    if(!comment){
        throw new ApiError(400,"This comment is not available")
    }
    if(!comment.owner.equals(req.user._id)){
        throw new ApiError(403,"You are not allowed to update this comment")
    }
    if(req.body.content) {
        comment.content = req.body.content
    }

    await comment.save()
    const updatedComment = await Comment.findById(comment._id)
    return res.status(200).json(new ApiResponse(200,"Comment updated successfully", updatedComment))
})

const getComments = asyncHandler(async (req, res)=>{
    const pipeline = [
        {
            $match:{video: new mongoose.Types.ObjectId(req.params.videoId)}
        },
        {
            $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
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
                "owner": {$first: "$owner"}
            }
        }
    ]
    const comments = await Comment.aggregate(pipeline)

    return res.status(200).json(new ApiResponse(200,"Comments list", comments))
})

const deleteComment = asyncHandler(async (req, res) => {
    const commentToDelete = await Comment.findById(req.params.id)
    if(!commentToDelete) {
        throw new ApiError(400, "Comment not available")
    }
    if(!commentToDelete.owner.equals(req.user._id)) {
        throw new ApiError(403, "You are not allowed to delete this comment")
    }
    await Comment.deleteOne(commentToDelete._id)
    return res.status(200).json(new ApiResponse(200,"Comment deleted successFully", commentToDelete))
})
export {addComment, updateComment, getComments, deleteComment}