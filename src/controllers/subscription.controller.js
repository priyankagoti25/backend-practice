import {Subscription} from "../models/subscription.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const subscribeChannel = asyncHandler(async (req, res)=>{
    const channel = await User.findById(req.params.channelId)
    if(!channel){
        throw new ApiError(400, "This channel is not available")
    }

    const existingSubscription = await Subscription.findOne({subscriber: req.user._id, channel: req.params.channelId})
    if(existingSubscription) {
        throw new ApiError(400, "You have already subscribed this channel")
    }

    const payload = {
        subscriber: req.user._id,
        channel: req.params.channelId
    }
    const newSubscription = new Subscription(payload)
    await newSubscription.save()
    if(channel?.subscriberCount && channel?.subscriberCount > 0) {
        channel.subscriberCount += 1
    } else {
        channel.subscriberCount = 1
    }
    await channel.save()
    const createdSubscription = await Subscription.findById(newSubscription._id)
    return res.status(201).json(new ApiResponse(201, "Subscribed successfully", createdSubscription))
})

const unsubscribeChannel = asyncHandler(async (req, res)=>{
    const channel = await User.findById(req.params.channelId)
    if(!channel){
        throw new ApiError(400, "This channel is not available")
    }

    const existingSubscription = await Subscription.findOne({subscriber: req.user._id, channel: req.params.channelId})

    if(!existingSubscription) {
        throw new ApiError(400, "You did not have subscription of this channel at all")
    }

    await Subscription.deleteOne(existingSubscription._id)

    if(channel?.subscriberCount && channel?.subscriberCount > 0) {
        channel.subscriberCount -= 1
    } else {
        channel.subscriberCount = 0
    }
    await channel.save()

    return res.status(201).json(new ApiResponse(201, "Unsubscribed successfully", existingSubscription))
})

export {subscribeChannel, unsubscribeChannel}