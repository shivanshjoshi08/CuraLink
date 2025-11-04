const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

const {
  createFavorite,
  deleteFavorite,
  getMyFavorites
} = require('../controllers/favorite.controller.js');

// GET /api/favorites (Get all of the logged-in user's favorites)
router.get('/', authMiddleware, getMyFavorites);

// POST /api/favorites (Save a new item)
router.post('/', authMiddleware, createFavorite);

// DELETE /api/favorites/:id (Remove an item, using the content_id)
router.delete('/:id', authMiddleware, deleteFavorite);

module.exports = router;