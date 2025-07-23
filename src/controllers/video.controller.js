import {asyncHandler} from "../utils/asyncHandler.js";
import {Video} from "../models/video.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";
import mongoose from "mongoose";

const getVideosList = asyncHandler(async (req, res)=>{
    const videos = await Video.aggregate([
        {
            $lookup:{
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'owner',
                pipeline:[
                    {
                        $project:{
                            fullName:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                owner:{$first:'$owner'}
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,"Videos list", videos))
})
const uploadVideo = asyncHandler(async (req, res)=>{
    const videoFilePath = req.files.videoFile?.[0]?.path
    const thumbnailPath = req.files.thumbnail?.[0]?.path
    const videoFile = await uploadOnCloudinary(videoFilePath)
    const thumbnail = await uploadOnCloudinary(thumbnailPath)
    const payload = {
        ...req.body,
        videoFile: videoFile?.url,
        thumbnail: thumbnail?.url,
        owner: req?.user?._id
    }
    const video = new Video(payload)
    const validationError = video.validateSync()
    if(validationError) {
        return res.status(400).json(validationError)
    }
    await video.save()
    const createdVideo = await Video.findById(video._id)
    return res.status(201).json(new ApiResponse(201,"Video uploaded successfully", createdVideo))
})

const updateVideo = asyncHandler(async (req, res)=>{
    const video = await Video.findById(req.params.id)
    if(!video){
        throw new ApiError(400, "Video does not exists with this id")
    }
    const videoFilePath = req.files.videoFile?.[0]?.path
    const thumbnailPath = req.files.thumbnail?.[0]?.path
    const videoFile = await uploadOnCloudinary(videoFilePath)
    const thumbnail = await uploadOnCloudinary(thumbnailPath)
    if(videoFile){
        video.videoFile = videoFile.url
    }
    if(thumbnail){
        video.thumbnail = thumbnail.url
    }
    if(req.body.title){
        video.title = req.body.title
    }
    if(req.body.description){
        video.description = req.body.description
    }
    if(req.body.duration){
        video.duration = req.body.duration
    }
    await video.save()
    const updatedVideo = await Video.findById(video._id)
    return res.status(200).json(new ApiResponse(200,"Video updated successfully", updatedVideo))
})
const increaseViews = asyncHandler(async (req, res)=>{
    const video = await Video.findById(req.params.id)
    video.views +=1
    await video.save()
    return res.status(200).json(new ApiResponse(200, "View increased", video))
})

const publishVideo = asyncHandler(async (req, res)=>{
    const video = await Video.findById(req.params.id)
    if(!video){
        throw new ApiError(400, "Video does not exists with this id")
    }
    video.isPublished = !video.isPublished
    await video.save()
    const updatedVideo = await Video.findById(video._id)
    return res.status(200).json(new ApiResponse(200,"Video updated successfully", updatedVideo))
})

const getVideoById = asyncHandler(async (req, res)=>{
    const video = await Video.aggregate([
        {
            $match: {_id: new mongoose.Types.ObjectId(req.params.id)}
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline:[
                    {
                        $project: {
                            refreshToken: 0,
                            watchHistory:0
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                "owner": { $first:"$owner"}
            }
        }
    ])
    if(video.length === 0){
        throw new ApiError(400, "Video not found")
    }

    return res.status(200).json(new ApiResponse(200, "Video Data",video))
})

export {uploadVideo, updateVideo, getVideosList, increaseViews, publishVideo, getVideoById}