import connectDB from "../db/index.js";
import {seedUsers} from "./users.js";
import dotenv from "dotenv"
dotenv.config({path: './.env'})
async function seed(){
    await connectDB()
    await seedUsers()
    console.log('Seeding done!');
    process.exit(0);
}
seed()