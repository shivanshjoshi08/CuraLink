const express = require('express');
const cors = require('cors');
const app = express(); // <-- 1. Create the app FIRST

// --- Middleware ---
// These MUST come BEFORE your routes
app.use(cors()); // 2. Allow requests from your frontend
app.use(express.json()); // 3. This is the fix: It parses JSON from forms

// --- Routes ---

// Import all your route files
const userRoutes = require('./routes/user.routes');
const publicationRoutes = require('./routes/publication.routes.js');
const trialRoutes = require('./routes/trial.routes.js');
const forumRoutes = require('./routes/forum.routes.js');
const postRoutes = require('./routes/post.routes.js');

// Use all your routes
app.use('/api/users', userRoutes);
app.use('/api/publications', publicationRoutes);
app.use('/api/trials', trialRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/posts', postRoutes);

// A simple test route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the CuraLink API!' });
});

// Export the app to be used by server.js
module.exports = app;