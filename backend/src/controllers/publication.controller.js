const Publication = require('../models/Publication');
const User = require('../models/User');

// --- (SIMULATED AI FUNCTION) ---
const getAiSummary = async (abstract) => {
  if (!abstract) {
    return "No abstract provided.";
  }
  await new Promise(resolve => setTimeout(resolve, 500)); 
  const sentences = abstract.split('.').slice(0, 3);
  let summary = sentences.join('.').trim();
  if (summary) {
    summary += '.';
  }
  return summary || "A summary of this publication.";
};
// --- (END SIMULATED AI FUNCTION) ---

// --- Create a new publication ---
const createPublication = async (req, res) => {
  try {
    const { title, journal, year, link, abstract } = req.body;
    const author_id = req.user.id; // Get author ID from auth middleware

    if (!title || !abstract) {
      return res.status(400).json({ message: 'Title and abstract are required' });
    }
    const summary = await getAiSummary(abstract);

    const publication = await Publication.create({
      title, journal, year, link, abstract, summary,
      author_id // This is the ObjectId from the logged-in user
    });

    res.status(201).json({
      message: 'Publication added successfully',
      publication
    });
  } catch (error) {
    console.error('Error creating publication:', error);
    res.status(500).json({ message: `Error creating publication: ${error.message}` });
  }
};

// --- Get all publications (Public) ---
const getAllPublications = async (req, res) => {
  try {
    const publications = await Publication.find()
      .populate('author_id', 'name')
      .sort({ year: -1 });

    const formattedPublications = publications.map(pub => ({
        id: pub._id,
        title: pub.title,
        journal: pub.journal,
        year: pub.year,
        link: pub.link,
        summary: pub.summary,
        author_id: pub.author_id._id,
        author_name: pub.author_id.name
    }));

    res.json(formattedPublications);
  } catch (error) {
    console.error('Error fetching all publications:', error);
    res.status(500).json({ message: 'Error fetching all publications' });
  }
};

// --- Get all publications for a specific user ---
const getPublicationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const publications = await Publication.find({ author_id: userId })
      .sort({ year: -1 });
    res.json(publications);
  } catch (error) {
    console.error('Error fetching publications:', error);
    res.status(500).json({ message: 'Error fetching publications' });
  }
};

// --- Get Recommended Publications (Patient Dashboard) ---
const getRecommendedPublications = async (req, res) => {
  try {
    const patient = req.user;
    if (!patient.conditions) {
      return res.json([]);
    }

    const keywords = patient.conditions.split(',').map(kw => kw.trim());
    const regex = new RegExp(keywords.join('|'), 'i');

    const publications = await Publication.find({
      $or: [
        { title: { $regex: regex } },
        { abstract: { $regex: regex } },
        { summary: { $regex: regex } }
      ]
    }).populate('author_id', 'name')
      .sort({ year: -1 });

    const formattedPublications = publications.map(pub => ({
        id: pub._id,
        title: pub.title,
        journal: pub.journal,
        year: pub.year,
        link: pub.link,
        summary: pub.summary,
        author_id: pub.author_id._id,
        author_name: pub.author_id.name
    }));

    res.json(formattedPublications);
  } catch (error) {
    console.error('Error fetching recommended publications:', error);
    res.status(500).json({ message: 'Error fetching recommended publications' });
  }
};

// --- Get a single publication by its ID ---
const getPublicationById = async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.id);
    if (!publication) {
      return res.status(404).json({ message: 'Publication not found' });
    }
    res.json(publication);
  } catch (error) {
    console.error('Error fetching publication:', error);
    res.status(500).json({ message: 'Error fetching publication' });
  }
};

// --- Update a publication ---
const updatePublication = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, journal, year, link, abstract } = req.body;
    let publication = await Publication.findById(id);

    if (!publication) {
      return res.status(404).json({ message: "Publication not found" });
    }

    // --- 1. THE FIX IS HERE ---
    // Use .equals() to compare Mongoose ObjectIds.
    // req.user._id is the raw ID from the user document.
    if (!publication.author_id.equals(req.user._id)) {
      return res.status(403).json({ message: "User not authorized to update this publication" });
    }

    const summary = (abstract !== publication.abstract) 
      ? await getAiSummary(abstract) 
      : publication.summary;

    publication.title = title;
    publication.journal = journal;
    publication.year = year;
    publication.link = link;
    publication.abstract = abstract;
    publication.summary = summary;

    await publication.save();
    res.json({ message: 'Publication updated successfully', publication });

  } catch (error) {
    console.error('Error updating publication:', error);
    res.status(500).json({ message: 'Error updating publication' });
  }
};

// --- Delete a publication ---
const deletePublication = async (req, res) => {
  try {
    const { id } = req.params;
    const publication = await Publication.findById(id);

    if (!publication) {
      return res.status(404).json({ message: "Publication not found" });
    }
    
    // --- 2. THE FIX IS HERE ---
    // Use .equals() to compare Mongoose ObjectIds.
    if (!publication.author_id.equals(req.user._id)) {
      return res.status(403).json({ message: "User not authorized to delete this publication" });
    }
    
    await publication.deleteOne();
    
    res.json({ message: 'Publication deleted successfully' });
  } catch (error) {
    console.error('Error deleting publication:', error);
    res.status(500).json({ message: `Error deleting publication: ${error.message}` });
  }
};

module.exports = {
  createPublication,
  getAllPublications,
  getPublicationsByUser,
  getRecommendedPublications,
  getPublicationById,
  updatePublication,
  deletePublication
};