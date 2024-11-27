// index.js or app.js (your main application file)
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Define the path to the uploads/images folder
const imagesPath = path.join(__dirname, 'uploads', 'images');
const audioPath = path.join(__dirname, 'uploads', 'audio');

// Serve the images folder at a public URL
app.use('/images', express.static(imagesPath));
app.use('/audio',express.static(audioPath));

app.use(cors());
// const authRoutes = require('./src/routes/v1/auth.routes'); // Adjust the path as necessary
const apiRoutes = require('./src/routes');

// Middleware to parse JSON requests

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))

// Use the auth routes
app.use('/api', apiRoutes);

// Error handling middleware (optional)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
