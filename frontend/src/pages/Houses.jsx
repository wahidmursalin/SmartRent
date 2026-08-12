import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BookmarkPlus } from "lucide-react";
import SearchBar from "../components/SearchBar";
import HouseCard from "../components/HouseCard";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../hooks/useFavorites";
import * as api from "../services/api";

const Houses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  const { user } = useAuth();
  const { isFavorite, toggleFavorite, canFavorite } = useFavorites();

  const filters = {
    location: searchParams.get("location") || "",
    propertyType: searchParams.get("propertyType") || "",
    minRent: searchParams.get("minRent") || "",
    maxRent: searchParams.get("maxRent") || "",
    bedrooms: searchParams.get("bedrooms") || "",
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  useEffect(() => {
    const fetchHouses = async () => {
      setLoading(true);
      try {
        const params = {};
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params[key] = value;
        });

        const { data } = await api.getHouses(params);
        setHouses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const handleSearch = (newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.location) params.set("location", newFilters.location);
    if (newFilters.propertyType) params.set("propertyType", newFilters.propertyType);
    if (newFilters.maxRent) params.set("maxRent", newFilters.maxRent);
    setSearchParams(params);
  };

  const handleSaveSearch = async () => {
    const name = window.prompt(
      "Name this search (e.g. \"Uttara under 20k\")",
      filters.location ? `Houses in ${filters.location}` : "My search"
    );
    if (!name) return;

    setSaving(true);
    setSaveStatus({ type: "", text: "" });
    try {
      await api.createSavedSearch({
        name,
        filters: {
          location: filters.location,
          propertyType: filters.propertyType,
          minRent: filters.minRent ? Number(filters.minRent) : undefined,
          maxRent: filters.maxRent ? Number(filters.maxRent) : undefined,
          bedrooms: filters.bedrooms ? Number(filters.bedrooms) : undefined,
        },
      });
      setSaveStatus({ type: "success", text: "Search saved! Find it in your dashboard." });
    } catch (err) {
      setSaveStatus({ type: "error", text: err.response?.data?.message || "Failed to save search" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Browse Houses</h1>

      <SearchBar onSearch={handleSearch} initial={filters} />

      {user?.role === "tenant" && hasActiveFilters && (
        <div className="max-w-3xl mx-auto mt-3 flex items-center justify-center">
          <button
            onClick={handleSaveSearch}
            disabled={saving}
            className="flex items-center gap-1.5 text-sm text-brand-600 font-medium hover:text-brand-700 disabled:opacity-60"
          >
            <BookmarkPlus size={15} /> {saving ? "Saving..." : "Save this search"}
          </button>
        </div>
      )}

      {saveStatus.text && (
        <p
          className={`text-center text-sm mt-2 ${
            saveStatus.type === "success" ? "text-green-600" : "text-red-500"
          }`}
        >
          {saveStatus.text}
        </p>
      )}

      <div className="mt-10">
        {loading ? (
          <Loading />
        ) : houses.length === 0 ? (
          <p className="text-gray-500 text-center py-16">
            No houses match your search. Try different filters.
          </p>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{houses.length} house(s) found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {houses.map((house) => (
                <HouseCard
                  key={house._id}
                  house={house}
                  showFavorite={canFavorite}
                  isFavorite={isFavorite(house._id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Houses;
