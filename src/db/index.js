import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
//I am adding this line to check docpulse again with ngrok live url

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DATABASE_URL}/${DB_NAME}`,
      {
        authSource: "admin",
      }
    );
    console.log(
      `MongoDB is connected!! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB connection FAILED ", error);
    process.exit(1);
  }
};

export default connectDB;
