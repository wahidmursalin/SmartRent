const SavedSearch = require("../models/SavedSearch");

// @route  GET /api/saved-searches
// @access Private (tenant)
const getSavedSearches = async (req, res) => {
  try {
    const searches = await SavedSearch.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(searches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  POST /api/saved-searches
// @desc   Save the current search/filter combination
// @access Private (tenant)
const createSavedSearch = async (req, res) => {
  try {
    const { name, filters } = req.body;

    if (!name) {
      return res.status(400).json({ message: "A name for this search is required" });
    }

    const search = await SavedSearch.create({
      user: req.user._id,
      name,
      filters: filters || {},
    });

    res.status(201).json(search);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/saved-searches/:id
// @access Private (tenant, owner only)
const deleteSavedSearch = async (req, res) => {
  try {
    const search = await SavedSearch.findById(req.params.id);

    if (!search) {
      return res.status(404).json({ message: "Saved search not found" });
    }

    if (search.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this saved search" });
    }

    await search.deleteOne();
    res.json({ message: "Saved search deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSavedSearches, createSavedSearch, deleteSavedSearch };
