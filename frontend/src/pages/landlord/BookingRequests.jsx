import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import * as api from "../../services/api";

const statusStyles = {
  pending: "bg-yellow-50 text-yellow-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

const BookingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  const fetchRequests = async () => {
    try {
      const { data } = await api.getBookingRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    setActingId(id);
    try {
      if (action === "approve") await api.approveBooking(id);
      else await api.rejectBooking(id);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} booking`);
    } finally {
      setActingId(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Booking Requests</h1>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
          No booking requests yet.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r._id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-800">Tenant: {r.tenant?.name}</p>
                  <p className="text-sm text-gray-500">{r.house?.title}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${statusStyles[r.status]}`}>
                  {r.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3 text-sm text-gray-600">
                <p>Move-in: {new Date(r.moveInDate).toLocaleDateString()}</p>
                <p>Contact: {r.tenant?.phone}</p>
              </div>

              {r.message && <p className="text-sm text-gray-500 mt-2 italic">"{r.message}"</p>}

              {r.status === "pending" && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleAction(r._id, "approve")}
                    disabled={actingId === r._id}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleAction(r._id, "reject")}
                    disabled={actingId === r._id}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingRequests;
