const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { fromEnv } = require('@aws-sdk/credential-provider-env');
const { format } = require('date-fns');
const dotenv = require('dotenv');

dotenv.config();

// Verify that environment variables are loaded
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID);
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'Loaded' : 'Not Loaded');
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME);

// Configure AWS SDK v3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: fromEnv(),
});

// Function to format date as dd:mm:yy
function formatDate() {
  return format(new Date(), 'dd:MM:yy');
}

// Function to upload file to S3
async function uploadFileToS3(file, callback) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME, // Specify your private bucket name here
    Key: `uploads/${formatDate()}_${file.originalname.trim()}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'private', // Ensure the file is private
  };

  try {
    const command = new PutObjectCommand(params);
    const data = await s3Client.send(command);
    callback(null, data);
  } catch (err) {
    callback(err);
  }
}

// Function to download file from S3
async function downloadFileFromS3(filename, callback) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME, // Specify your private bucket name here
    Key: `uploads/${filename}`, // Ensure the key format matches the upload format
  };

  try {
    const command = new GetObjectCommand(params);
    const data = await s3Client.send(command);
    // console.log('Downloaded file:', data);
    const fileStream = data.Body;
    callback(null, fileStream);
  } catch (err) {
    callback(err);
  }
}

module.exports = {
  uploadFileToS3,
  downloadFileFromS3,
};