const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

const {
  createTrial,
  getAllTrials,
  getMyTrials,
  updateTrial,
  deleteTrial,
  getRecommendedTrials,
  getTrialById
} = require('../controllers/trial.controller');

// GET /api/trials (Get all trials - Public for patients)
router.get('/', getAllTrials);

// GET /api/trials/my-trials (Get trials for logged-in researcher - Secure)
router.get('/my-trials', authMiddleware, getMyTrials);

// POST /api/trials (Create a new trial - Secure)
router.post('/', authMiddleware, createTrial);

// PUT /api/trials/:id (Update a trial - Secure)
router.put('/:id', authMiddleware, updateTrial);

// DELETE /api/trials/:id (Delete a trial - Secure)
router.delete('/:id', authMiddleware, deleteTrial);

// GET /api/trials/recommended (Get personalized trials)
router.get('/recommended', authMiddleware, getRecommendedTrials); // <-- ADD THIS

router.get('/:id', getTrialById);

module.exports = router;