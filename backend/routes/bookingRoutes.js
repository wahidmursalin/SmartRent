const express = require("express");
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingRequests,
  approveBooking,
  rejectBooking,
  cancelBooking,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.post("/", protect, authorize("tenant"), createBooking);
router.get("/my-bookings", protect, authorize("tenant"), getMyBookings);
router.get("/requests", protect, authorize("landlord"), getBookingRequests);
router.put("/:id/approve", protect, authorize("landlord"), approveBooking);
router.put("/:id/reject", protect, authorize("landlord"), rejectBooking);
router.put("/:id/cancel", protect, authorize("tenant"), cancelBooking);

module.exports = router;
