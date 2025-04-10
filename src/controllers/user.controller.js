import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js";
import {validationErrors} from "../utils/helper.js";


const registerUser = asyncHandler(async (req, res)=>{
    const user = new User(req.body)
    const validationError = user.validateSync()

    if(validationError) {
        // const formattedErrors = {};
        // for(const field in validationError.errors){
        //     formattedErrors[field] = validationError.errors[field].message
        // }
        // const errors = new ApiError(400,validationError._message, formattedErrors)
        const errors = validationErrors(validationError)
        res.status(400).json({errors})
    }
})

export {registerUser}