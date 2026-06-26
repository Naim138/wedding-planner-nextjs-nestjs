// const cloudinary = require('cloudinary').v2
import {v2 as cloudinary} from 'cloudinary'
import {config} from 'dotenv'
config({
    path:'.env'
})

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SCREATE

cloudinary.config({
    api_key:apiKey,
    api_secret:apiSecret,
    cloud_name:cloudName
})

export const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret)

export default cloudinary
