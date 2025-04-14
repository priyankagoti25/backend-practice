import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js";
import {validationErrors} from "../utils/helper.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

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
            $set: { refreshToken: undefined}
        },
        {
            new: true
        }
    )
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

export {registerUser, loginUser, logoutUser, refreshAccessToken}