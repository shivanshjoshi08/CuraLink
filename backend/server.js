// Load environment variables from .env file
require('dotenv').config();

// Import the main app
const app = require('./src/app');

// Import the new database connection function
const connectDB = require('./src/config/db');

// --- NEW ---
// Connect to the database
connectDB();

// Get the port from environment variables, or default to 3000
const port = process.env.PORT || 3000;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});