import { Link } from "react-router-dom";
import { MapPin, BedDouble, Bath, Heart } from "lucide-react";

const PLACEHOLDER = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&q=60";

// showFavorite / isFavorite / onToggleFavorite are optional — pages that don't
// track favorites (e.g. landlord views) can simply omit them and no heart is shown.
const HouseCard = ({ house, showFavorite = false, isFavorite = false, onToggleFavorite }) => {
  const handleFavoriteClick = (e) => {
    e.preventDefault(); // don't navigate when clicking the heart inside the Link-wrapped image
    e.stopPropagation();
    onToggleFavorite?.(house._id);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <Link to={`/houses/${house._id}`}>
          <img
            src={house.images?.[0] || PLACEHOLDER}
            alt={house.title}
            className="w-full h-44 object-cover"
          />
        </Link>

        {!house.available && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            Rented
          </span>
        )}

        {showFavorite && (
          <button
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white shadow-sm"
          >
            <Heart
              size={16}
              className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}
            />
          </button>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 truncate">{house.title}</h3>

        <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
          <MapPin size={14} />
          {house.location?.area}, {house.location?.city}
        </p>

        <div className="flex items-center gap-4 text-gray-500 text-sm mt-2">
          <span className="flex items-center gap-1">
            <BedDouble size={14} /> {house.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath size={14} /> {house.bathrooms}
          </span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-brand-600 font-bold">৳{house.rent?.toLocaleString()}/mo</span>
          <Link
            to={`/houses/${house._id}`}
            className="text-sm bg-brand-50 text-brand-600 px-3 py-1.5 rounded-lg hover:bg-brand-100"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HouseCard;
