const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

// Import all the new Mongoose controller functions
const {
  createPublication,
  getAllPublications,
  getPublicationsByUser,
  getRecommendedPublications,
  getPublicationById,
  updatePublication,
  deletePublication
} = require('../controllers/publication.controller');

// --- Secure Routes (Require Login Token) ---

// POST /api/publications (Create a new publication)
router.post('/', authMiddleware, createPublication);

// GET /api/publications/recommended (Get personalized publications)
router.get('/recommended', authMiddleware, getRecommendedPublications);

// PUT /api/publications/:id (Update a publication)
router.put('/:id', authMiddleware, updatePublication);

// DELETE /api/publications/:id (Delete a publication)
router.delete('/:id', authMiddleware, deletePublication);

// --- Public Routes ---

// GET /api/publications (Get all publications)
router.get('/', getAllPublications);

// GET /api/publications/user/:userId (Get all publications for one user)
router.get('/user/:userId', getPublicationsByUser);

// GET /api/publications/:id (Get a single publication)
router.get('/:id', getPublicationById);

module.exports = router;