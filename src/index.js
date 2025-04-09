import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({path: './env'})

connectDB()










//Not recommended way of listening and db connection

/*

import express from "express"
const app = express()
const port = process.env.PORT

(async ()=>{
    try {
        await mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.error("ERROR: ", error)
            throw error
        })

        app.listen(port,()=>{
            console.log(`App is listening on http://localhost:${port}`)
        })

    } catch (error) {
        console.error("ERROR: ", error)
        throw error
    }
})()
*/
