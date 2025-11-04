const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  forum_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Forum'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', PostSchema);