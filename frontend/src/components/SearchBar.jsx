import { useState } from "react";
import { Search } from "lucide-react";

const SearchBar = ({ onSearch, initial = {} }) => {
  const [location, setLocation] = useState(initial.location || "");
  const [propertyType, setPropertyType] = useState(initial.propertyType || "");
  const [maxRent, setMaxRent] = useState(initial.maxRent || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ location, propertyType, maxRent });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-md p-3 flex flex-col sm:flex-row gap-2 w-full max-w-3xl mx-auto"
    >
      <input
        type="text"
        placeholder="Location (e.g. Uttara)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />

      <select
        value={propertyType}
        onChange={(e) => setPropertyType(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        <option value="">Any Type</option>
        <option value="Apartment">Apartment</option>
        <option value="House">House</option>
        <option value="Studio">Studio</option>
        <option value="Duplex">Duplex</option>
        <option value="Room">Room</option>
      </select>

      <input
        type="number"
        placeholder="Max Rent"
        value={maxRent}
        onChange={(e) => setMaxRent(e.target.value)}
        className="w-full sm:w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />

      <button
        type="submit"
        className="bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 flex items-center justify-center gap-1"
      >
        <Search size={16} /> Search
      </button>
    </form>
  );
};

export default SearchBar;
