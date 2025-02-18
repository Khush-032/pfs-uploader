require('dotenv').config();

const express = require('express');
const path = require('path');
const multer = require('multer');
const s3Functions = require('./s3'); // Ensure this path is correct
const app = express();

const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0"; // Ensure it binds to all interfaces


// Set up Multer storage (no disk storage for direct upload to S3)
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });




// Endpoint to upload file to private S3 bucket
app.post('/api/upload', upload.single('file'), (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  // Call the S3 function to upload the file
  s3Functions.uploadFileToS3(file, (err, data) => {
    if (err) {
      console.error('Error uploading file to S3:', err);
      return res.status(500).send(`Error uploading file to S3: ${err.message}`);
    }
    res.status(200).send(`File uploaded successfully.`);
  });
});

// Endpoint to get file from private S3 bucket
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename.trim();

  console.log('Downloading file:', filename);

  // Call the S3 function to download the file
  s3Functions.downloadFileFromS3(filename, (err, fileStream) => {
    if (err) {
      console.error('Error downloading file from S3:', err);
      return res.status(500).send(`Error downloading file from S3: ${err.message}`);
    }
     // Set appropriate headers and pipe the file stream to the response
     res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
     fileStream.pipe(res);
  });
});

// Serve static files (index.html, CSS, JS, etc.) @ root from the 'Frontend' directory
app.use(express.static(path.join(__dirname, '..', 'Frontend')));
// console.log(path.join(__dirname, '..', 'Frontend'));


// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../Frontend', 'index.html'));
// });

app.listen(PORT,HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});