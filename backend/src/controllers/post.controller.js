const Post = require('../models/Post');
const Reply = require('../models/Reply');

// --- Create a new post (Patients Only) ---
const createPost = async (req, res) => {
  try {
    const { id: author_id, role } = req.user;

    if (role !== 'patient') {
      return res.status(403).json({ message: 'Forbidden: Only patients can create posts' });
    }

    const { title, content, forum_id } = req.body;
    if (!title || !content || !forum_id) {
      return res.status(400).json({ message: 'Title, content, and forum ID are required' });
    }

    const post = await Post.create({
      title,
      content,
      author_id,
      forum_id
    });

    res.status(201).json({
      message: 'Post created successfully',
      id: post._id
    });

  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: `Error creating post: ${error.message}` });
  }
};

// --- Create a new reply (Researchers Only) ---
const createReply = async (req, res) => {
  try {
    const { id: author_id, role } = req.user;

    if (role !== 'researcher') {
      return res.status(403).json({ message: 'Forbidden: Only researchers can reply' });
    }

    const { content, post_id } = req.body;
    if (!content || !post_id) {
      return res.status(400).json({ message: 'Content and post ID are required' });
    }

    const reply = await Reply.create({
      content,
      author_id,
      post_id
    });

    res.status(201).json({
      message: 'Reply added successfully',
      id: reply._id
    });

  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({ message: `Error creating reply: ${error.message}` });
  }
};

// --- Get a single post AND its replies (Public) ---
const getPostById = async (req, res) => {
  const { id } = req.params;
  try {
    // Query 1: Get the post
    const post = await Post.findById(id)
      .populate('author_id', 'name role');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Query 2: Get all replies for that post
    const replies = await Reply.find({ post_id: id })
      .populate('author_id', 'name profile_picture_url conditions') // 'conditions' is specialties
      .sort({ createdAt: 'asc' }); // Show oldest first

    // Reformat data for frontend
    const formattedPost = {
        id: post._id,
        title: post.title,
        content: post.content,
        created_at: post.createdAt,
        author_name: post.author_id.name,
        author_role: post.author_id.role
    };

    const formattedReplies = replies.map(reply => ({
        id: reply._id,
        content: reply.content,
        created_at: reply.createdAt,
        author_name: reply.author_id.name,
        profile_picture_url: reply.author_id.profile_picture_url,
        specialties: reply.author_id.conditions // Send specialties
    }));

    res.json({ post: formattedPost, replies: formattedReplies });

  } catch (error) {
    console.error('Error fetching post data:', error);
    res.status(500).json({ message: 'Error fetching post data' });
  }
};

module.exports = {
  createPost,
  createReply,
  getPostById
};