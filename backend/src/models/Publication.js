const mongoose = require('mongoose');

const PublicationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // This creates the link to the User model
  },
  journal: String,
  year: Number,
  link: String,
  abstract: String,
  summary: String // For the AI summary
}, {
  timestamps: true
});

module.exports = mongoose.model('Publication', PublicationSchema);