const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

// 1. Import all the new Mongoose controller functions
const {
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllResearchers,
  getUserById,
  getRecommendedExperts,
  getResearcherDashboardStats
} = require('../controllers/user.controller');

// --- Auth Routes (Public) ---
// POST /api/users/register
router.post('/register', registerUser);

// POST /api/users/login
router.post('/login', loginUser);

// --- Secure Routes (Require Login Token) ---

// PUT /api/users/ (Updates the logged-in user)
// We use '/' because the ID comes from the token, not the URL
router.put('/', authMiddleware, updateUser);

// DELETE /api/users/ (Deletes the logged-in user)
router.delete('/', authMiddleware, deleteUser);

// GET /api/users/dashboard-stats (Get stats for logged-in researcher)
router.get('/dashboard-stats', authMiddleware, getResearcherDashboardStats);

// GET /api/users/recommended-experts (Get personalized experts for patient)
router.get('/recommended-experts', authMiddleware, getRecommendedExperts);

// --- Public Routes ---

// GET /api/users/researchers (Get all researchers for 'Find Experts' page)
router.get('/researchers', getAllResearchers);

// GET /api/users/:id (Get a single user's public profile)
// IMPORTANT: This must be one of the last GET routes
router.get('/:id', getUserById);

module.exports = router;