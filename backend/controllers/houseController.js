const House = require("../models/House");

// @route  GET /api/houses
// @desc   Get all houses with search/filter (public)
// @access Public
const getHouses = async (req, res) => {
  try {
    const { location, minRent, maxRent, bedrooms, propertyType, search, available } = req.query;

    const query = {};

    if (location) {
      query.$or = [
        { "location.area": { $regex: location, $options: "i" } },
        { "location.city": { $regex: location, $options: "i" } },
      ];
    }

    if (minRent || maxRent) {
      query.rent = {};
      if (minRent) query.rent.$gte = Number(minRent);
      if (maxRent) query.rent.$lte = Number(maxRent);
    }

    if (bedrooms) query.bedrooms = Number(bedrooms);
    if (propertyType) query.propertyType = propertyType;
    if (available !== undefined) query.available = available === "true";

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const houses = await House.find(query)
      .populate("landlord", "name email phone")
      .sort({ createdAt: -1 });

    res.json(houses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/houses/my-houses
// @desc   Get houses of logged-in landlord
// @access Private (landlord)
const getMyHouses = async (req, res) => {
  try {
    const houses = await House.find({ landlord: req.user._id }).sort({ createdAt: -1 });
    res.json(houses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/houses/:id
// @access Public
const getHouseById = async (req, res) => {
  try {
    const house = await House.findById(req.params.id).populate(
      "landlord",
      "name email phone"
    );

    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    res.json(house);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  POST /api/houses
// @access Private (landlord only)
const createHouse = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      rent,
      bedrooms,
      bathrooms,
      size,
      propertyType,
      images,
      facilities,
    } = req.body;

    if (!title || !description || !location || !rent || bedrooms === undefined || bathrooms === undefined) {
      return res.status(400).json({ message: "Missing required house fields" });
    }

    const house = await House.create({
      title,
      description,
      location,
      rent,
      bedrooms,
      bathrooms,
      size,
      propertyType,
      images: images || [],
      facilities: facilities || [],
      landlord: req.user._id,
    });

    res.status(201).json(house);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/houses/:id
// @access Private (landlord who owns the house)
const updateHouse = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);

    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    if (house.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this house" });
    }

    const updatable = [
      "title",
      "description",
      "location",
      "rent",
      "bedrooms",
      "bathrooms",
      "size",
      "propertyType",
      "images",
      "facilities",
      "available",
    ];

    updatable.forEach((field) => {
      if (req.body[field] !== undefined) house[field] = req.body[field];
    });

    const updated = await house.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  DELETE /api/houses/:id
// @access Private (landlord who owns the house)
const deleteHouse = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);

    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    if (house.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this house" });
    }

    await house.deleteOne();
    res.json({ message: "House deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHouses,
  getMyHouses,
  getHouseById,
  createHouse,
  updateHouse,
  deleteHouse,
};
