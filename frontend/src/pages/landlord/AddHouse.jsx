import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../../services/api";

const FACILITY_OPTIONS = ["Parking", "Lift", "Gas", "Security", "Generator", "Wifi", "CCTV"];
const PROPERTY_TYPES = ["Apartment", "House", "Studio", "Duplex", "Room"];

const AddHouse = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    area: "",
    city: "",
    rent: "",
    bedrooms: "",
    bathrooms: "",
    size: "",
    propertyType: "Apartment",
    image: "",
    facilities: [],
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleFacility = (facility) => {
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await api.createHouse({
        title: form.title,
        description: form.description,
        location: { area: form.area, city: form.city },
        rent: Number(form.rent),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        size: form.size ? Number(form.size) : undefined,
        propertyType: form.propertyType,
        images: form.image ? [form.image] : [],
        facilities: form.facilities,
      });
      navigate("/landlord/my-houses");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add house");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Add New House</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div>}

        <div>
          <label className="text-sm font-medium text-gray-700">Property Title</label>
          <input
            name="title"
            required
            value={form.title}
            onChange={handleChange}
            placeholder="Modern 3 Bedroom Apartment"
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            required
            rows={3}
            value={form.description}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Area</label>
            <input
              name="area"
              required
              value={form.area}
              onChange={handleChange}
              placeholder="Uttara"
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">City</label>
            <input
              name="city"
              required
              value={form.city}
              onChange={handleChange}
              placeholder="Dhaka"
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Monthly Rent (৳)</label>
          <input
            type="number"
            name="rent"
            required
            min="0"
            value={form.rent}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Bedrooms</label>
            <input
              type="number"
              name="bedrooms"
              required
              min="0"
              value={form.bedrooms}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Bathrooms</label>
            <input
              type="number"
              name="bathrooms"
              required
              min="0"
              value={form.bathrooms}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Size (sqft)</label>
            <input
              type="number"
              name="size"
              min="0"
              value={form.size}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Property Type</label>
          <select
            name="propertyType"
            value={form.propertyType}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">House Image URL</label>
          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="https://..."
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Facilities</label>
          <div className="flex flex-wrap gap-2">
            {FACILITY_OPTIONS.map((facility) => (
              <button
                type="button"
                key={facility}
                onClick={() => toggleFacility(facility)}
                className={`text-sm px-3 py-1.5 rounded-full border ${
                  form.facilities.includes(facility)
                    ? "bg-brand-600 text-white border-brand-600"
                    : "border-gray-200 text-gray-600"
                }`}
              >
                {facility}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Adding..." : "Add House"}
        </button>
      </form>
    </div>
  );
};

export default AddHouse;
