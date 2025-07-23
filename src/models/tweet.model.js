import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    likesCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

export const Tweet = mongoose.model("Tweet", tweetSchema)