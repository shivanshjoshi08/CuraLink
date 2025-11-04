const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

const {
  createPost,
  createReply,
  getPostById
} = require('../controllers/post.controller');

// GET /api/posts/:id (Get one post and its replies)
router.get('/:id', getPostById);

// POST /api/posts (Create a new post - PROTECTED, Patient only)
router.post('/', authMiddleware, createPost);

// POST /api/posts/reply (Create a new reply - PROTECTED, Researcher only)
router.post('/reply', authMiddleware, createReply);

module.exports = router;