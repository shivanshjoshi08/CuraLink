const Favorite = require('../models/Favorite');
const User = require('../models/User');
const Publication = require('../models/Publication');
const ClinicalTrial = require('../models/ClinicalTrial');

// --- Add an item to favorites ---
const createFavorite = async (req, res) => {
  try {
    const { content_id, content_type } = req.body;
    const user_id = req.user.id;

    if (!content_id || !content_type) {
      return res.status(400).json({ message: 'Content ID and type are required' });
    }

    // Check if it's already favorited
    const existing = await Favorite.findOne({ user_id, content_id });
    if (existing) {
      return res.status(409).json({ message: 'Item already in favorites' });
    }

    const favorite = await Favorite.create({
      user_id,
      content_id,
      content_type
    });

    res.status(201).json({
      message: 'Added to favorites',
      favorite
    });

  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ message: `Error adding favorite: ${error.message}` });
  }
};

// --- Remove an item from favorites ---
const deleteFavorite = async (req, res) => {
  try {
    const { id: content_id } = req.params; // We'll pass the content ID in the URL
    const user_id = req.user.id;

    const result = await Favorite.findOneAndDelete({ user_id, content_id });

    if (!result) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Removed from favorites' });

  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ message: `Error removing favorite: ${error.message}` });
  }
};

// --- Get all of the user's favorites ---
const getMyFavorites = async (req, res) => {
  try {
    const user_id = req.user.id;

    // 1. Get all of the user's favorite "documents"
    const favorites = await Favorite.find({ user_id });

    // 2. Separate the IDs by their type
    const userIds = favorites
      .filter(f => f.content_type === 'User')
      .map(f => f.content_id);

    const pubIds = favorites
      .filter(f => f.content_type === 'Publication')
      .map(f => f.content_id);

    const trialIds = favorites
      .filter(f => f.content_type === 'ClinicalTrial')
      .map(f => f.content_id);

    // 3. Fetch all the data for each type in parallel
    const [users, publications, trials] = await Promise.all([
      User.find({ _id: { $in: userIds } }).select('name profile_picture_url conditions'),
      Publication.find({ _id: { $in: pubIds } }).populate('author_id', 'name'),
      ClinicalTrial.find({ _id: { $in: trialIds } }).populate('researcher_id', 'name')
    ]);

    // 4. Send the organized data back to the frontend
    res.json({
      experts: users,
      publications: publications.map(pub => ({
        id: pub._id,
        title: pub.title,
        journal: pub.journal,
        year: pub.year,
        summary: pub.summary,
        author_name: pub.author_id.name
      })),
      trials: trials.map(trial => ({
        id: trial._id,
        title: trial.title,
        status: trial.status,
        researcher_name: trial.researcher_id.name
      }))
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(Setting0).json({ message: 'Error fetching favorites' });
  }
};

module.exports = {
  createFavorite,
  deleteFavorite,
  getMyFavorites
};