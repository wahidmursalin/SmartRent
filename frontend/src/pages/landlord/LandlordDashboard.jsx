import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home as HomeIcon, CheckCircle2, Clock, Plus } from "lucide-react";
import Loading from "../../components/Loading";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../services/api";

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const statusStyles = {
  pending: "bg-yellow-50 text-yellow-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

const LandlordDashboard = () => {
  const { user } = useAuth();
  const [houses, setHouses] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [housesRes, requestsRes] = await Promise.all([
          api.getMyHouses(),
          api.getBookingRequests(),
        ]);
        setHouses(housesRes.data);
        setRequests(requestsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const availableCount = houses.filter((h) => h.available).length;
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  if (loading) return <Loading />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name?.split(" ")[0]}</h1>
          <p className="text-gray-500">Manage your properties and booking requests.</p>
        </div>
        <Link
          to="/landlord/add-house"
          className="flex items-center gap-1 bg-brand-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700"
        >
          <Plus size={16} /> Add New House
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard
          icon={<HomeIcon size={20} className="text-brand-600" />}
          label="Total Houses"
          value={houses.length}
          color="bg-brand-50"
        />
        <StatCard
          icon={<CheckCircle2 size={20} className="text-green-600" />}
          label="Available"
          value={availableCount}
          color="bg-green-50"
        />
        <StatCard
          icon={<HomeIcon size={20} className="text-gray-500" />}
          label="Rented"
          value={houses.length - availableCount}
          color="bg-gray-100"
        />
        <StatCard
          icon={<Clock size={20} className="text-yellow-600" />}
          label="Pending Requests"
          value={pendingCount}
          color="bg-yellow-50"
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Recent Booking Requests</h2>
        <Link to="/landlord/requests" className="text-brand-600 text-sm font-medium">
          View all
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
          No booking requests yet.
        </div>
      ) : (
        <div className="space-y-3 mb-10">
          {requests.slice(0, 5).map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-gray-800">{r.house?.title}</p>
                <p className="text-sm text-gray-500">Tenant: {r.tenant?.name}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${statusStyles[r.status]}`}>
                {r.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">My Houses</h2>
        <Link to="/landlord/my-houses" className="text-brand-600 text-sm font-medium">
          View all
        </Link>
      </div>

      {houses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
          You haven't added any houses yet.
        </div>
      ) : (
        <div className="space-y-3">
          {houses.slice(0, 5).map((h) => (
            <div
              key={h._id}
              className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between"
            >
              <p className="font-medium text-gray-800">{h.title}</p>
              <div className="flex items-center gap-3">
                <span className="text-brand-600 font-semibold text-sm">৳{h.rent?.toLocaleString()}</span>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    h.available ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {h.available ? "Available" : "Rented"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LandlordDashboard;
