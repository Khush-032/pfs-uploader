const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { fromEnv } = require('@aws-sdk/credential-provider-env');
const { format } = require('date-fns');
const dotenv = require('dotenv');

dotenv.config();

// Configure AWS SDK v3
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: fromEnv(),
});

// Function to format date as dd-MM-yy
const formatDate = () => format(new Date(), 'dd-MM-yy');

/**
 * Uploads a file to an S3 bucket.
 * @param {Object} file - The file object containing buffer and metadata.
 * @returns {Promise<Object>} - Resolves with upload data or throws an error.
 */
const uploadFileToS3 = async (file) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `uploads/${formatDate()}_${file.originalname.trim()}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'private',
    };
    
    try {
        const command = new PutObjectCommand(params);
        return await s3Client.send(command);
    } catch (err) {
        console.error('Error uploading file to S3:', err);
        throw err;
    }
};

/**
 * Downloads a file from an S3 bucket.
 * @param {string} filename - The name of the file to download.
 * @returns {Promise<Stream>} - Resolves with a readable stream or throws an error.
 */
const downloadFileFromS3 = async (filename) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `uploads/${filename}`,
    };
    
    try {
        const command = new GetObjectCommand(params);
        const data = await s3Client.send(command);
        return data.Body;
    } catch (err) {
        console.error('Error downloading file from S3:', err);
        throw err;
    }
};

module.exports = {
    uploadFileToS3,
    downloadFileFromS3,
};
