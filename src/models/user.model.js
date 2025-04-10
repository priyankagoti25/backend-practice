import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'username is required'],
        unique: true,
        lowercase: true,
        minlength:[6,'minimum 6 characters are required'],
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: [true, 'email already exists'],
        lowercase: true,
        trim: true,
        validate: {
            validator: function (value) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: "Invalid email"
        }
    },
    fullName: {
        type: String,
        required: [true, 'fullName is required'],
        trim: true,
        index: true
    },
    avatar: {
        type: String, // cloudinary
        required: [true, 'avatar is required'],
    },
    coverImage: {
        type: String, // cloudinary
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        minlength:[6,'minimum 6 characters are required'],
        required: [true, "Password is required"]
    },
    refreshToken: {
        type: String,
    }

},{ timestamps: true })

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next()
    this.password = await bcrypt(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password){
   return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
   return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {_id: this._id,},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    )
}
export const User = mongoose.model('User', userSchema)