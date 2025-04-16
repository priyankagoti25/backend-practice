import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {PORT} from "./constants.js";
import {app} from "./app.js";

dotenv.config({path: './.env'})

// connectDB()
//     .then(async ()=>{
//         await app.listen(PORT,()=>{
//             console.log(`Server is running on http://localhost:${PORT}`)
//         })
//     })
//     .catch((err)=>{
//         console.log("MongoDB connection Failed ", err)
//     })

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
};

await startServer();









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
