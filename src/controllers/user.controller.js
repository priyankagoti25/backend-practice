import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js";
import {validationErrors} from "../utils/helper.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false})
        return { accessToken, refreshToken }
    } catch (e) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async (req, res)=>{
    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    const payload = {
        ...req.body,
        username: req.body.username?.toLowerCase(),
        email: req.body.email?.toLowerCase(),
        avatar: avatar?.url,
        coverImage: coverImage?.url || ""
    }
    const user = new User(payload)
    const validationError = user.validateSync()
    if(validationError) {
        const errors = validationErrors(validationError)
        res.status(400).json(errors)
    }

    const existedUser = await User.findOne({$or:[{username: payload.username}, {email: payload.email}]})
    if(existedUser) {
        res.status(400).json(new ApiError(400, "User already exists"))
    }

    await user.save()

    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user")
    }

    res.status(201).json(new ApiResponse(201, "User registered successfully", createdUser))
})

const loginUser = asyncHandler( async (req,res)=>{

    const {email, password} = req.body
    if(!email){
        res.status(400).json(new ApiError(400,"email is required",{email:"email is required"}))
    }
    if(!password){
        res.status(400).json(new ApiError(400,"password is required",{password:"password is required"}))
    }

    const user = await User.findOne({email: email.toLowerCase()})

    if(!user){
        res.status(400).json(new ApiError(400,"User does not exist"))
    }

    const isValidPassword = await user.isPasswordCorrect(password)
    if(!isValidPassword) {
        res.status(400).json(new ApiError(400,"Invalid password"))
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true
    }
    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, refreshToken)
        .json(new ApiResponse(200, "User logged in successfully", {user: loggedInUser, accessToken, refreshToken}))
})

const logoutUser = asyncHandler(async (req, res)=>{
    const user =  await User.findByIdAndUpdate(
        req?.user?._id,
        {
            $unset: { refreshToken: 1}
        },
        {
            new: true
        }
    )
    await user.save({validateBeforeSave: false})
   const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req,res) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

        if(!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)
        if(!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

        const options = {
            httpOnly: true,
            secure: true
        }

        res.status(200)
            .cookie("accessToken", accessToken,options)
            .cookie("refreshToken", refreshToken,options)
            .json(
                new ApiResponse(
                    200,
                    "Access token is refreshed",
                    { accessToken, refreshToken },
                )
            )

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res)=>{
    const { oldPassword, newPassword} = req.body

    const user = await User.findById(req?.user?._id)
    const isOldPasswordCorrect = user.isPasswordCorrect(oldPassword)
    if(!isOldPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})
    res.status(200).send(200, "Password changed successfully")

})

const getCurrentUser = asyncHandler(async (req, res)=>{
    res.status(200).json(new ApiResponse(200, "Success", req.user))
})

const updateAccountDetails = asyncHandler(async (req, res)=>{
    const { fullName, email} = req.body

    if(!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: {fullName,email}},
        {new: true}
    ).select("-password -refreshToken")

    res.status(200).json(new ApiResponse(200, "Account details updated successfully", user))
})

const updateUserAvatar = asyncHandler(async (req, res)=>{
    console.log('req.files', req.files)
    console.log('req.file', req.file)
    const avatarLocalPath = req.file.path

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar?.url){
        throw new ApiError(400, "Error while uploading on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: {avatar: avatar.url}},
        {new: true}
    ).select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(200, "Avatar updated successfully", user))
})

const updateUserCoverImage = asyncHandler(async (req, res)=>{
    const coverImageLocalPath = req.file.path

    if(!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage?.url){
        throw new ApiError(400, "Error while uploading on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: {coverImage: coverImage.url}},
        {new: true}
    ).select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(200, "Cover image updated successfully", user))
})

const getUserChannelProfile = asyncHandler(async (req, res)=>{
    const { username } = req.params
    if(!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channels = await User.aggregate([
        {
            $match: {username: username?.toLowerCase()},
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {$size: "$subscribers"},
                subscribedToCount: {$size: "$subscribedTo"},
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id,"$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
                createdAt: 1
            }
        }
    ])

    if(!channels.length) {
        throw new ApiError(404, "Channels does not exists")
    }

    return res.status(200).json(new ApiResponse(200,"Success", channel[0]))
})

const getWatchHistory = asyncHandler(async (req, res)=>{

    const user = await User.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(req.user?._id)}
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $first: "$owner"}
                        }
                    }
                ]
            }
        },
        {
            $project: {
                fullName: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                watchHistory: 1,
                createdAt: 1
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200,"Watch History fetched successfully", user[0]))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}