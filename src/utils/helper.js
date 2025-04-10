import {ApiError} from "./ApiError.js";

export const validationErrors = (validationError) => {
    const formattedErrors = {};
    for(const field in validationError.errors){
        formattedErrors[field] = validationError.errors[field].message
    }
    return new ApiError(400,validationError._message, formattedErrors)
}