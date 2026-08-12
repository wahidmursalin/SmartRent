const express = require("express");
const router = express.Router();
const { getFavorites, toggleFavorite } = require("../controllers/favoriteController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/", protect, authorize("tenant"), getFavorites);
router.post("/:houseId", protect, authorize("tenant"), toggleFavorite);

module.exports = router;
