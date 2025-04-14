import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId, //One who is subscribes channel
        ref: "User",
        required: true
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId, // One that user will subscribe
        ref: "User",
        required: true
    }
}, {timestamps: true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema)