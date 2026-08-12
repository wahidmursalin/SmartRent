import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../../components/Loading";
import * as api from "../../services/api";

const statusStyles = {
  pending: "bg-yellow-50 text-yellow-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    try {
      const { data } = await api.getMyBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking request?")) return;
    setCancellingId(id);
    try {
      await api.cancelBooking(id);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
          No bookings yet.{" "}
          <Link to="/houses" className="text-brand-600 font-medium">
            Browse houses
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <Link to={`/houses/${b.house?._id}`} className="font-semibold text-gray-800 hover:text-brand-600">
                    {b.house?.title}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    {b.house?.location?.area}, {b.house?.location?.city}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${statusStyles[b.status]}`}>
                  {b.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3 text-sm text-gray-600">
                <p>Move-in: {new Date(b.moveInDate).toLocaleDateString()}</p>
                <p>Rent: ৳{b.house?.rent?.toLocaleString()}/mo</p>
              </div>

              {b.message && <p className="text-sm text-gray-500 mt-2 italic">"{b.message}"</p>}

              {["pending", "approved"].includes(b.status) && (
                <button
                  onClick={() => handleCancel(b._id)}
                  disabled={cancellingId === b._id}
                  className="mt-4 text-sm text-red-500 font-medium hover:text-red-700 disabled:opacity-50"
                >
                  {cancellingId === b._id ? "Cancelling..." : "Cancel Booking"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
