import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, BedDouble, Bath, Ruler, CheckCircle2, Heart, MessageCircle } from "lucide-react";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../hooks/useFavorites";
import * as api from "../services/api";

const PLACEHOLDER = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=60";

const HouseDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, canFavorite } = useFavorites();

  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [moveInDate, setMoveInDate] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    const fetchHouse = async () => {
      setLoading(true);
      try {
        const { data } = await api.getHouseById(id);
        setHouse(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHouse();
  }, [id]);

  const handleRequestClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setShowForm(true);
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: "", text: "" });
    try {
      await api.createBooking({ houseId: id, moveInDate, message });
      setStatus({ type: "success", text: "Booking request sent successfully!" });
      setShowForm(false);
      setMoveInDate("");
      setMessage("");
    } catch (err) {
      setStatus({ type: "error", text: err.response?.data?.message || "Failed to send request" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMessageLandlord = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setMessaging(true);
    try {
      const { data } = await api.startConversation({
        recipientId: house.landlord._id,
        houseId: house._id,
      });
      navigate(`/messages?conversation=${data._id}`);
    } catch (err) {
      setStatus({ type: "error", text: err.response?.data?.message || "Failed to start conversation" });
    } finally {
      setMessaging(false);
    }
  };

  if (loading) return <Loading />;
  if (!house) return <p className="text-center py-16 text-gray-500">House not found.</p>;

  const favorited = isFavorite(house._id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="relative">
        <img
          src={house.images?.[0] || PLACEHOLDER}
          alt={house.title}
          className="w-full h-72 object-cover rounded-2xl mb-6"
        />
        {canFavorite && (
          <button
            onClick={() => toggleFavorite(house._id)}
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white shadow-sm"
          >
            <Heart size={18} className={favorited ? "fill-red-500 text-red-500" : "text-gray-500"} />
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold text-gray-800">{house.title}</h1>
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              house.available ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
            }`}
          >
            {house.available ? "Available" : "Rented"}
          </span>
        </div>

        <p className="text-gray-500 flex items-center gap-1 mt-2">
          <MapPin size={16} /> {house.location?.area}, {house.location?.city}
        </p>

        <p className="text-brand-600 text-2xl font-bold mt-3">
          ৳{house.rent?.toLocaleString()} <span className="text-sm font-normal text-gray-400">/ month</span>
        </p>

        <div className="flex items-center gap-6 text-gray-600 mt-4">
          <span className="flex items-center gap-1">
            <BedDouble size={18} /> {house.bedrooms} Bedrooms
          </span>
          <span className="flex items-center gap-1">
            <Bath size={18} /> {house.bathrooms} Bathrooms
          </span>
          {house.size && (
            <span className="flex items-center gap-1">
              <Ruler size={18} /> {house.size} sqft
            </span>
          )}
        </div>

        <p className="text-gray-700 mt-4 leading-relaxed">{house.description}</p>

        {house.facilities?.length > 0 && (
          <div className="mt-5">
            <h3 className="font-semibold text-gray-800 mb-2">Facilities</h3>
            <div className="flex flex-wrap gap-2">
              {house.facilities.map((f, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 text-sm bg-gray-50 text-gray-600 px-3 py-1 rounded-full"
                >
                  <CheckCircle2 size={14} className="text-brand-500" /> {f}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-gray-500">
            Landlord: <span className="text-gray-800 font-medium">{house.landlord?.name}</span>
          </p>

          {user?.role === "tenant" && (
            <button
              onClick={handleMessageLandlord}
              disabled={messaging}
              className="flex items-center gap-1.5 text-sm text-brand-600 font-medium hover:text-brand-700 disabled:opacity-60"
            >
              <MessageCircle size={16} /> {messaging ? "Starting chat..." : "Message Landlord"}
            </button>
          )}
        </div>

        {status.text && (
          <div
            className={`mt-4 text-sm rounded-lg px-3 py-2 ${
              status.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
            }`}
          >
            {status.text}
          </div>
        )}

        {user?.role === "tenant" && house.available && !showForm && (
          <button
            onClick={handleRequestClick}
            className="mt-6 w-full sm:w-auto bg-brand-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-700"
          >
            Request Booking
          </button>
        )}

        {!user && house.available && (
          <button
            onClick={handleRequestClick}
            className="mt-6 w-full sm:w-auto bg-brand-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-700"
          >
            Login to Request Booking
          </button>
        )}

        {showForm && (
          <form onSubmit={handleSubmitBooking} className="mt-6 border-t border-gray-100 pt-6 space-y-4">
            <h3 className="font-semibold text-gray-800">Send Booking Request</h3>

            <div>
              <label className="text-sm font-medium text-gray-700">Move-in Date</label>
              <input
                type="date"
                required
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Message (optional)</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="I want to rent this apartment..."
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Send Request"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-500 px-4 py-2.5"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default HouseDetails;
