const Booking = require("../models/Booking");
const House = require("../models/House");

// @route  POST /api/bookings
// @desc   Tenant requests a booking for a house
// @access Private (tenant only)
const createBooking = async (req, res) => {
  try {
    const { houseId, message, moveInDate } = req.body;

    if (!houseId || !moveInDate) {
      return res.status(400).json({ message: "houseId and moveInDate are required" });
    }

    const house = await House.findById(houseId);

    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    // Critical logic: prevent booking an already unavailable house
    if (!house.available) {
      return res.status(400).json({ message: "This house is not available for booking" });
    }

    // Prevent duplicate pending request by same tenant for same house
    const existing = await Booking.findOne({
      house: houseId,
      tenant: req.user._id,
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({ message: "You already have a pending request for this house" });
    }

    const booking = await Booking.create({
      house: houseId,
      tenant: req.user._id,
      landlord: house.landlord,
      message: message || "",
      moveInDate,
      status: "pending",
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/bookings/my-bookings
// @desc   Tenant views their own bookings
// @access Private (tenant)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ tenant: req.user._id })
      .populate("house", "title rent location images")
      .populate("landlord", "name email phone")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/bookings/requests
// @desc   Landlord views booking requests for their houses
// @access Private (landlord)
const getBookingRequests = async (req, res) => {
  try {
    const bookings = await Booking.find({ landlord: req.user._id })
      .populate("house", "title rent location images")
      .populate("tenant", "name email phone")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/bookings/:id/approve
// @access Private (landlord who owns the house)
const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ message: `Booking is already ${booking.status}` });
    }

    booking.status = "approved";
    await booking.save();

    // Mark house unavailable so no one else can book it
    await House.findByIdAndUpdate(booking.house, { available: false });

    // Auto-reject other pending requests for the same house
    await Booking.updateMany(
      { house: booking.house, _id: { $ne: booking._id }, status: "pending" },
      { status: "rejected" }
    );

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/bookings/:id/reject
// @access Private (landlord who owns the house)
const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ message: `Booking is already ${booking.status}` });
    }

    booking.status = "rejected";
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  PUT /api/bookings/:id/cancel
// @desc   Tenant cancels their own booking
// @access Private (tenant who owns the booking)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!["pending", "approved"].includes(booking.status)) {
      return res.status(400).json({ message: `Cannot cancel a ${booking.status} booking` });
    }

    const wasApproved = booking.status === "approved";

    booking.status = "cancelled";
    await booking.save();

    // If it was approved, free up the house again
    if (wasApproved) {
      await House.findByIdAndUpdate(booking.house, { available: true });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingRequests,
  approveBooking,
  rejectBooking,
  cancelBooking,
};
