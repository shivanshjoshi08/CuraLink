const mongoose = require('mongoose');

const ClinicalTrialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  researcher_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  description: String,
  status: {
    type: String,
    enum: ['Recruiting', 'Active, not recruiting', 'Completed', 'Other'],
    default: 'Recruiting'
  },
  eligibility: String,
  location: String,
  contact_email: String
}, {
  timestamps: true
});

module.exports = mongoose.model('ClinicalTrial', ClinicalTrialSchema);