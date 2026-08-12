const mongoose = require("mongoose");

const houseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    location: {
      area: { type: String, required: true },
      city: { type: String, required: true },
    },
    rent: {
      type: Number,
      required: [true, "Rent is required"],
      min: 0,
    },
    bedrooms: { type: Number, required: true, min: 0 },
    bathrooms: { type: Number, required: true, min: 0 },
    size: { type: Number }, // in sqft
    propertyType: {
      type: String,
      enum: ["Apartment", "House", "Studio", "Duplex", "Room"],
      default: "Apartment",
    },
    images: [{ type: String }], // array of image URLs
    facilities: [{ type: String }],
    available: {
      type: Boolean,
      default: true,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Text index for search
houseSchema.index({ title: "text", "location.area": "text", "location.city": "text" });

module.exports = mongoose.model("House", houseSchema);
