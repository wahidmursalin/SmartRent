const express = require("express");
const router = express.Router();
const {
  getSavedSearches,
  createSavedSearch,
  deleteSavedSearch,
} = require("../controllers/savedSearchController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/", protect, authorize("tenant"), getSavedSearches);
router.post("/", protect, authorize("tenant"), createSavedSearch);
router.delete("/:id", protect, authorize("tenant"), deleteSavedSearch);

module.exports = router;
