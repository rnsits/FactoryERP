// index.js or app.js (your main application file)
const express = require('express');
const app = express();
// const authRoutes = require('./src/routes/v1/auth.routes'); // Adjust the path as necessary
const apiRoutes = require('./src/routes');

// Middleware to parse JSON requests
app.use(express.json());

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
