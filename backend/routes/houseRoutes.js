const express = require("express");
const router = express.Router();
const {
  getHouses,
  getMyHouses,
  getHouseById,
  createHouse,
  updateHouse,
  deleteHouse,
} = require("../controllers/houseController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// IMPORTANT: /my-houses must be declared BEFORE /:id, otherwise
// Express will treat "my-houses" as an :id param.
router.get("/my-houses", protect, authorize("landlord"), getMyHouses);

router.get("/", getHouses);
router.get("/:id", getHouseById);

router.post("/", protect, authorize("landlord"), createHouse);
router.put("/:id", protect, authorize("landlord"), updateHouse);
router.delete("/:id", protect, authorize("landlord"), deleteHouse);

module.exports = router;
