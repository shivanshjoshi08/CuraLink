const Forum = require('../models/Forum');
const Post = require('../models/Post');

// --- Create a new forum (Researchers Only) ---
const createForum = async (req, res) => {
  try {
    const { id: userId, role } = req.user;

    if (role !== 'researcher') {
      return res.status(403).json({ message: 'Forbidden: Only researchers can create forums' });
    }

    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const forum = await Forum.create({
      title,
      description: description || null,
      created_by_user_id: userId
    });

    res.status(201).json({
      message: 'Forum created successfully',
      id: forum._id
    });

  } catch (error) {
    if (error.code === 11000) { // Mongoose duplicate key error
      return res.status(409).json({ message: 'A forum with this title already exists' });
    }
    console.error('Error creating forum:', error);
    res.status(500).json({ message: `Error creating forum: ${error.message}` });
  }
};

// --- Get all forums (Public) ---
const getAllForums = async (req, res) => {
  try {
    const forums = await Forum.find()
      .populate('created_by_user_id', 'name')
      .sort({ createdAt: -1 });

    // Reformat data
    const formattedForums = forums.map(forum => ({
        id: forum._id,
        title: forum.title,
        description: forum.description,
        author_name: forum.created_by_user_id.name,
        created_at: forum.createdAt
    }));

    res.json(formattedForums);
  } catch (error) {
    console.error('Error fetching forums:', error);
    res.status(500).json({ message: 'Error fetching forums' });
  }
};

// --- Get a single forum AND its posts (Public) ---
const getForumById = async (req, res) => {
  const { id } = req.params;
  try {
    // Query 1: Get the forum details
    const forum = await Forum.findById(id)
      .populate('created_by_user_id', 'name');

    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    // Query 2: Get all posts in that forum
    const posts = await Post.find({ forum_id: id })
      .populate('author_id', 'name')
      .sort({ createdAt: -1 });

    // Reformat posts
    const formattedPosts = posts.map(post => ({
        id: post._id,
        title: post.title,
        author_name: post.author_id.name,
        created_at: post.createdAt
    }));

    // Combine and send
    res.json({
      forum: {
        id: forum._id,
        title: forum.title,
        description: forum.description,
        author_name: forum.created_by_user_id.name
      },
      posts: formattedPosts
    });

  } catch (error) {
    console.error('Error fetching forum data:', error);
    res.status(500).json({ message: 'Error fetching forum data' });
  }
};

module.exports = {
  createForum,
  getAllForums,
  getForumById
};