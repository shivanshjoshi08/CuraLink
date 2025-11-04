const User = require('../models/User'); // Import the Mongoose model
const Publication = require('../models/Publication'); // <-- ADD THIS
const Reply = require('../models/Reply');           // <-- ADD THIS
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// --- Helper function to create a token ---
const generateToken = (id, role, name, profile_picture_url) => {
  return jwt.sign(
    { id, role, name, profile_picture_url }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' }
  );
};

// --- Register a new user ---
// (Replaces the old registerUser)
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    // Create new user (password is automatically hashed by the 'pre.save' in the model)
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    if (user) {
      // Don't send a token on register, force them to login
      res.status(201).json({
        message: 'User registered successfully',
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: `Error registering user: ${error.message}` });
  }
};

// --- Log in a user ---
// (Replaces the old loginUser)
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email (and explicitly ask for the password, which is hidden)
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists AND if password matches
    if (user && (await user.comparePassword(password))) {
      // Password matches. Create token.
      const token = generateToken(user._id, user.role, user.name, user.profile_picture_url);

      res.json({
        message: 'Logged in successfully',
        token: token,
        user: {
          id: user._id, // Send MongoDB's '_id' as 'id'
          name: user.name,
          email: user.email,
          role: user.role,
          profile_picture_url: user.profile_picture_url,
          conditions: user.conditions,
          about: user.about
        }
      });
    } else {
      // User not found or password incorrect
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: `Error logging in user: ${error.message}` });
  }
};

// --- Update a user profile ---
// (Replaces the old updateUser)
const updateUser = async (req, res) => {
  try {
    // req.user.id comes from our authMiddleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields that were sent in the body
    user.name = req.body.name || user.name;
    user.profile_picture_url = req.body.profile_picture_url || user.profile_picture_url;
    user.conditions = req.body.conditions || user.conditions;
    user.about = req.body.about || user.about;

    // Handle email change separately if you want to add verification
    if (req.body.email && req.body.email !== user.email) {
       // Add logic here to check if new email is unique
       user.email = req.body.email;
    }

    const updatedUser = await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profile_picture_url: updatedUser.profile_picture_url,
        conditions: updatedUser.conditions,
        about: updatedUser.about
      }
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: `Error updating user: ${error.message}` });
  }
};

// --- Delete a user (Secure) ---
// (Replaces the old deleteUser)
const deleteUser = async (req, res) => {
  try {
    // Get the user ID from the token
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // We'll add logic here to delete their publications, posts, etc. first
    // await Publication.deleteMany({ author_id: user._id });
    // await Post.deleteMany({ author_id: user._id });

    await user.deleteOne(); // Mongoose v6+

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: `Error deleting user: ${error.message}` });
  }
};

// --- Get all researchers (for 'Find Experts' page) ---
// (Replaces old getAllResearchers)
const getAllResearchers = async (req, res) => {
  try {
    const researchers = await User.find({ role: 'researcher' })
      .select('id name email profile_picture_url conditions about');

    res.json(researchers);
  } catch (error) {
    console.error('Error fetching researchers:', error);
    res.status(500).json({ message: 'Error fetching researchers' });
  }
};

// --- Get a single user by ID ---
// (Replaces old getUserById)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('id name email profile_picture_url conditions about role');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// --- Get Recommended Experts (Patient Dashboard) ---
const getRecommendedExperts = async (req, res) => {
  try {
    const patient = req.user;
    if (!patient.conditions) {
      return res.json([]); // No conditions, no recommendations
    }

    // Create a regex to search for any of the conditions
    const keywords = patient.conditions.split(',').map(kw => kw.trim());
    const regex = new RegExp(keywords.join('|'), 'i'); // 'i' for case-insensitive

    const researchers = await User.find({
      role: 'researcher',
      conditions: { $regex: regex } // Search specialties (conditions)
    }).select('id name profile_picture_url conditions');

    res.json(researchers);
  } catch (error) {
    console.error('Error fetching recommended experts:', error);
    res.status(500).json({ message: 'Error fetching recommended experts' });
  }
};

// --- Get Researcher Dashboard Stats ---
// --- Get Researcher Dashboard Stats ---
const getResearcherDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get counts
    const pubCount = await Publication.countDocuments({ author_id: userId });
    const replyCount = await Reply.countDocuments({ author_id: userId });
    const collaboratorCount = await User.countDocuments({ 
      role: 'researcher', 
      _id: { $ne: userId } // $ne means 'not equal'
    });

    // 2. Get unanswered posts
    // Find all post IDs this researcher has already replied to
    const repliedPostIds = await Reply.find({ author_id: userId }).distinct('post_id');

    // Find all posts that are NOT in that list
    const unansweredPosts = await Post.find({
      author_id: { $ne: userId },   // Not their own post
      _id: { $nin: repliedPostIds } // $nin means 'not in'
    })
    .limit(5)
    .sort({ createdAt: -1 })
    .select('id title'); // Only select the fields we need

    // 3. Get potential collaborators
    const collaborators = await User.find({
      role: 'researcher',
      _id: { $ne: userId }
    })
    .limit(6)
    .select('id name profile_picture_url conditions');

    // 4. Combine and send
    res.json({
      stats: {
        publicationCount: pubCount,
        replyCount: replyCount,
        collaboratorCount: collaboratorCount,
        repliesNeededCount: unansweredPosts.length
      },
      collaborators: collaborators.map(c => ({
          id: c._id,
          name: c.name,
          profile_picture_url: c.profile_picture_url,
          specialties: c.conditions
      })),
      unansweredPosts: unansweredPosts.map(p => ({
          id: p._id,
          title: p.title
      }))
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

// We don't need getAllUsers anymore for now

module.exports = {
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllResearchers,
  getUserById,
  getRecommendedExperts,
  getResearcherDashboardStats
};