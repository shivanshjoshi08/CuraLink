const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

const {
  createForum,
  getAllForums,
  getForumById
} = require('../controllers/forum.controller');

// GET /api/forums (Get all forums)
router.get('/', getAllForums);

// POST /api/forums (Create a new forum - PROTECTED)
router.post('/', authMiddleware, createForum);

// GET /api/forums/:id (Get one forum and its posts)
router.get('/:id', getForumById);

module.exports = router;