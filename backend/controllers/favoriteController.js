const User = require("../models/User");
const House = require("../models/House");

// @route  GET /api/favorites
// @desc   Get logged-in tenant's favorite houses (populated)
// @access Private (tenant)
const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "favorites",
      populate: { path: "landlord", select: "name email phone" },
    });

    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  POST /api/favorites/:houseId
// @desc   Toggle a house in the tenant's favorites (add if absent, remove if present)
// @access Private (tenant)
const toggleFavorite = async (req, res) => {
  try {
    const { houseId } = req.params;

    const house = await House.findById(houseId);
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    const user = await User.findById(req.user._id);

    const index = user.favorites.findIndex((id) => id.toString() === houseId);
    let favorited;

    if (index === -1) {
      user.favorites.push(houseId);
      favorited = true;
    } else {
      user.favorites.splice(index, 1);
      favorited = false;
    }

    await user.save();

    res.json({ houseId, favorited });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFavorites, toggleFavorite };
