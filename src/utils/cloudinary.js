import { V2 as cloudinary} from "cloudinary"
import fs from 'fs'
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null

        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: 'auto'
        })
        //file has been uploaded successfully

        console.log('Response:--->', response)
        console.log('Url:--->', response.url)
        return response
    } catch (e) {
        fs.unlinkSync(localFilePath) //remove the locally temporary saved file as upload operation got failed
        return null
    }
}

export { uploadOnCloudinary }