import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Loading from "../../components/Loading";
import * as api from "../../services/api";

const PLACEHOLDER = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&q=60";

const MyHouses = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchHouses = async () => {
    try {
      const { data } = await api.getMyHouses();
      setHouses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this house? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await api.deleteHouse(id);
      setHouses((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete house");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleAvailability = async (house) => {
    try {
      const { data } = await api.updateHouse(house._id, { available: !house.available });
      setHouses((prev) => prev.map((h) => (h._id === house._id ? data : h)));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update availability");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Houses</h1>
        <Link
          to="/landlord/add-house"
          className="flex items-center gap-1 bg-brand-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700"
        >
          <Plus size={16} /> Add New House
        </Link>
      </div>

      {houses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
          You haven't added any houses yet.
        </div>
      ) : (
        <div className="space-y-4">
          {houses.map((h) => (
            <div key={h._id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
              <img
                src={h.images?.[0] || PLACEHOLDER}
                alt={h.title}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{h.title}</p>
                <p className="text-sm text-gray-500">
                  {h.location?.area}, {h.location?.city}
                </p>
                <p className="text-brand-600 font-semibold text-sm mt-1">
                  ৳{h.rent?.toLocaleString()}/mo
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => toggleAvailability(h)}
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    h.available ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {h.available ? "Available" : "Rented"}
                </button>

                <div className="flex gap-2">
                  <Link
                    to={`/landlord/edit-house/${h._id}`}
                    className="p-2 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(h._id)}
                    disabled={deletingId === h._id}
                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyHouses;
