const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  // This is the ID of the thing being favorited (e.g., a publication, a user, or a trial)
  content_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  // This tells us what kind of thing is being favorited
  content_type: {
    type: String,
    required: true,
    enum: ['User', 'Publication', 'ClinicalTrial']
  }
}, {
  timestamps: true
});

// Create a compound index to prevent a user from favoriting the same item twice
FavoriteSchema.index({ user_id: 1, content_id: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);