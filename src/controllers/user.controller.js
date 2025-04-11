import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js";
import {validationErrors} from "../utils/helper.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";


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

    res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"))
})

export {registerUser}