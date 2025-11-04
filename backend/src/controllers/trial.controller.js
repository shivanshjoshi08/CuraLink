const ClinicalTrial = require('../models/ClinicalTrial');

// --- Create a new trial (Researchers Only) ---
const createTrial = async (req, res) => {
  try {
    const { id: researcher_id, role } = req.user;

    if (role !== 'researcher') {
      return res.status(403).json({ message: 'Forbidden: Only researchers can create trials' });
    }

    const { title, description, status, eligibility, location, contact_email } = req.body;
    if (!title || !status) {
      return res.status(400).json({ message: 'Title and status are required' });
    }

    const trial = await ClinicalTrial.create({
      researcher_id, title, description, status, eligibility, location, contact_email
    });

    res.status(201).json({
      message: 'Clinical trial added successfully',
      id: trial._id
    });

  } catch (error) {
    console.error('Error creating trial:', error);
    res.status(500).json({ message: `Error creating trial: ${error.message}` });
  }
};

// --- Get all trials (Public) ---
const getAllTrials = async (req, res) => {
  try {
    const trials = await ClinicalTrial.find()
      .populate('researcher_id', 'name')
      .sort({ createdAt: -1 });

    const formattedTrials = trials.map(trial => ({
      id: trial._id,
      title: trial.title,
      description: trial.description,
      status: trial.status,
      location: trial.location,
      researcher_name: trial.researcher_id.name,
      researcher_id: trial.researcher_id._id
    }));

    res.json(formattedTrials);
  } catch (error) {
    console.error('Error fetching all trials:', error);
    res.status(500).json({ message: 'Error fetching all trials' });
  }
};

// --- Get trials for the logged-in researcher (Secure) ---
const getMyTrials = async (req, res) => {
  try {
    const { id: researcher_id } = req.user;
    const trials = await ClinicalTrial.find({ researcher_id })
      .sort({ createdAt: -1 });
    res.json(trials);
  } catch (error) {
    console.error('Error fetching user trials:', error);
    res.status(500).json({ message: 'Error fetching user trials' });
  }
};

// --- Update a trial (Owner Only) ---
const updateTrial = async (req, res) => {
  try {
    const { id: trialId } = req.params;
    let trial = await ClinicalTrial.findById(trialId);

    if (!trial) {
      return res.status(404).json({ message: "Trial not found" });
    }

    // --- 1. THE FIX IS HERE ---
    // Use .equals() to compare Mongoose ObjectIds.
    if (!trial.researcher_id.equals(req.user._id)) {
      return res.status(403).json({ message: "User not authorized to edit this trial" });
    }

    const updatedTrial = await ClinicalTrial.findByIdAndUpdate(
      trialId,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ message: 'Trial updated successfully', trial: updatedTrial });

  } catch (error) {
    console.error('Error updating trial:', error);
    res.status(500).json({ message: `Error updating trial: ${error.message}` });
  }
};

// --- Delete a trial (Owner Only) ---
const deleteTrial = async (req, res) => {
  try {
    const { id: trialId } = req.params;
    const trial = await ClinicalTrial.findById(trialId);

    if (!trial) {
      return res.status(404).json({ message: "Trial not found" });
    }

    // --- 2. THE FIX IS HERE ---
    // Use .equals() to compare Mongoose ObjectIds.
    if (!trial.researcher_id.equals(req.user._id)) {
      return res.status(403).json({ message: "User not authorized to delete this trial" });
    }

    await trial.deleteOne();

    res.json({ message: 'Trial deleted successfully' });
  } catch (error) {
    console.error('Error deleting trial:', error);
    res.status(500).json({ message: `Error deleting trial: ${error.message}` });
  }
};

// --- Get Recommended Trials (for Patient Dashboard) ---
const getRecommendedTrials = async (req, res) => {
  try {
    const patient = req.user;
    if (patient.role !== 'patient') {
      return res.status(403).json({ message: 'This feature is for patients only.' });
    }
    if (!patient.conditions) {
      return res.json([]);
    }

    const keywords = patient.conditions.split(',').map(kw => kw.trim());
    const regex = new RegExp(keywords.join('|'), 'i');

    const trials = await ClinicalTrial.find({
      $or: [
        { title: { $regex: regex } },
        { description: { $regex: regex } },
        { eligibility: { $regex: regex } }
      ]
    }).populate('researcher_id', 'name')
      .sort({ createdAt: -1 });

    const formattedTrials = trials.map(trial => ({
      id: trial._id,
      title: trial.title,
      description: trial.description,
      status: trial.status,
      location: trial.location,
      researcher_name: trial.researcher_id.name
    }));

    res.json(formattedTrials);
  } catch (error) {
    console.error('Error fetching recommended trials:', error);
    res.status(500).json({ message: 'Error fetching recommended trials' });
  }
};


// --- Get a single trial by its ID (Public) ---
// --- Get a single trial by its ID (Public) ---
const getTrialById = async (req, res) => {
  try {
    const { id } = req.params;

    // --- THIS IS THE FIX ---
    // Use findById() to get a single document, not find()
    const trial = await ClinicalTrial.findById(id)
      .populate('researcher_id', 'name profile_picture_url conditions'); // Get author details

    if (!trial) {
      return res.status(404).json({ message: 'Trial not found' });
    }

    // --- END FIX ---

    // Reformat data to send
    const formattedTrial = {
      id: trial._id,
      title: trial.title,
      description: trial.description,
      status: trial.status,
      eligibility: trial.eligibility,
      location: trial.location,
      contact_email: trial.contact_email,
      researcher: {
        id: trial.researcher_id._id,
        name: trial.researcher_id.name,
        profile_picture_url: trial.researcher_id.profile_picture_url,
        specialties: trial.researcher_id.conditions
      }
    };

    res.json(formattedTrial);

  } catch (error) {
    console.error('Error fetching trial:', error);
    res.status(500).json({ message: 'Error fetching trial' });
  }
};

module.exports = {
  createTrial,
  getAllTrials,
  getMyTrials,
  updateTrial,
  deleteTrial,
  getRecommendedTrials,
  getTrialById
};