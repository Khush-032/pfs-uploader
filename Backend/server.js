require('dotenv').config();

const express = require('express');
const path = require('path');
const multer = require('multer');
const s3Functions = require('./s3'); // Ensure this path is correct

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; // Ensure it binds to all interfaces

// Set up Multer storage for memory-based uploads (direct S3 upload)
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Upload file to private S3 bucket
 */
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const data = await s3Functions.uploadFileToS3(req.file);
        res.status(200).json({ message: 'File uploaded successfully.', data });
    } catch (err) {
        console.error('Error uploading file to S3:', err);
        res.status(500).json({ error: `Error uploading file to S3: ${err.message}` });
    }
});

/**
 * Get file from private S3 bucket
 */
app.get('/api/download/:filename', async (req, res) => {
    try {
        const filename = req.params.filename.trim();
        console.log('Downloading file:', filename);

        const fileStream = await s3Functions.downloadFileFromS3(filename);
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        fileStream.pipe(res);
    } catch (err) {
        console.error('Error downloading file from S3:', err);
        res.status(500).json({ error: `Error downloading file from S3: ${err.message}` });
    }
});

// Serve static files (index.html, CSS, JS, etc.) from the 'Frontend' directory
app.use(express.static(path.join(__dirname, '..', 'Frontend')));

app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
});
