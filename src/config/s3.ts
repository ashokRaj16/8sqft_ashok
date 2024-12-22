import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'; 

// import exp from 'constants';
import fs from 'fs';
import multers3 from 'multer-s3'; 
import multer from 'multer';
import path from 'path';

const bucketName = process.env.AWS_BUCKET_NAME || "";
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY || '';
const secretAccessKey = process.env.AWS_SECRET_KEY || '';

const client = new S3Client({
    credentials : {
        accessKeyId :accessKeyId,
        secretAccessKey: secretAccessKey
    },
    region,
})

const s3Storage = multers3({
    s3: client,
    bucket : bucketName,
    metadata : (req, file, cb) => {
        cb(null, {fieldName: file.filename})
    },
    key : (req, file, cb) => {
        const fileName =  Date.now() + "_" + file.fieldname + "_" + file.originalname;
        cb(null, fileName);
    },
})

const sanitizeFile = (file : any, cb: any) => {
    const fileExts = [".png", ".jpg", ".jpeg", ".gif"];

    // Check allowed extensions
    const isAllowedExt = fileExts.includes(
        path.extname(file.originalname.toLowerCase())
    );

    // Mime type must be an image
    const isAllowedMimeType = file.mimetype.startsWith("image/");

    if (isAllowedExt && isAllowedMimeType) {
        return cb(null, true); // no errors
    } else {
        // pass error msg to callback, which can be display in frontend
        cb("Error: File type not allowed!");
    }
}

export const uploadImage = multer( {
    storage : s3Storage,
    fileFilter: (req : any, file : any, cb : any) => { 
        sanitizeFile(file, cb)
    },
    limits : {
        fileSize : 1024 * 1024 * 2 // 2 MB
    }
})

// Upload an image.
export const uploadImageToS3 = async (file : any) => {
    const fileStream = fs.createReadStream(file.path)
    const uploadParams = new PutObjectCommand({
        Bucket : bucketName,
        Body : fileStream,
        Key: file.filename
    })
    try{
        const response = await client.send(uploadParams);
        console.log(response);
        return response;
    }
    catch(error)
    {
        return error;
    }
}

// Retrieve an image.
export const getImageFromS3 = (fileKey: any) => {
    const downloadParams = {
        Key: fileKey,
        Bucket: bucketName,
    }
    const objects = new GetObjectCommand(downloadParams);
    return objects;
}

// // Upload an audio.
// export const uploadAudioToS3 = (file: any) => {
//     const audioFileStream = fs.createReadStream(file.path);
//     const uploadParams = {
//         Bucket : bucketName,
//         Body : audioFileStream,
//         Key: file.filename
//     }

//     return s3.upload(uploadParams);
// }

// // Retrieve an audio.
// export const getAudioFromS3 = (fileKey : any) => {
//     const downloadParams = {
//         Key: fileKey,
//         Bucket : bucketName,
//     }

//     s3.getObject(downloadParams);
// }

// // Retrieve an video.
// export const uploadVideoToS3 = (file: any) => {

//     const fileStream = file.createReadStream();
//     const uploadParams = {
//         Bucket: bucketName,
//         Body: fileStream,
//         Key: file.filename,
//     }
//     s3.upload(uploadParams);
// }

// // Retrieve an video.
// export const getVideoFromS3 = (fileKey : any) => {

//     const downloadParams = {
//         Bucket : bucketName,
//         Key : fileKey
//     }

//     s3.getObject(downloadParams);
// }