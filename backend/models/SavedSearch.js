const mongoose = require("mongoose");

const savedSearchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    filters: {
      location: { type: String, default: "" },
      propertyType: { type: String, default: "" },
      minRent: { type: Number },
      maxRent: { type: Number },
      bedrooms: { type: Number },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SavedSearch", savedSearchSchema);
