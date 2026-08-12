import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import HouseCard from "../../components/HouseCard";
import Loading from "../../components/Loading";
import * as api from "../../services/api";

const Favorites = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      const { data } = await api.getFavorites();
      setHouses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleToggleFavorite = async (houseId) => {
    // Optimistically remove from the list since this page only shows favorites
    setHouses((prev) => prev.filter((h) => h._id !== houseId));
    try {
      await api.toggleFavorite(houseId);
    } catch (err) {
      console.error(err);
      fetchFavorites(); // re-sync on failure
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2">
        <Heart size={22} className="text-red-500 fill-red-500" /> My Favorites
      </h1>

      {houses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
          You haven't favorited any houses yet.{" "}
          <Link to="/houses" className="text-brand-600 font-medium">
            Browse houses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {houses.map((house) => (
            <HouseCard
              key={house._id}
              house={house}
              showFavorite
              isFavorite
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
