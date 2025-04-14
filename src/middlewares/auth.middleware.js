import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";


export const verifyJWT = asyncHandler(async (req, res, next)=>{
    try {
        const token =  req.cookies?.accessToken || req.headers['Authorization']?.replace("Bearer ","") || req.headers['authorization']?.replace("Bearer ","")
        if(!token) {
            res.status(401).json(new ApiError(401,"Unauthorized request"))
        }
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user) {
            res.status(401).json(new ApiError(401,"Invalid Access Token"))
        }

        req.user = user
        next()

    } catch (e){
        res.status(401).json(new ApiError(401,"Invalid Access Token"))
    }
})