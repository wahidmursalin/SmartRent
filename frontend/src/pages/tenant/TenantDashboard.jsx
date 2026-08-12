import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  Heart,
  MessageSquare,
  User,
  LogOut,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Send,
  MessageCircle,
  Home as HomeIcon,
  ChevronRight,
  Mail,
  Phone,
  Lightbulb,
  MapPin,
  Trash2,
} from "lucide-react";
import Loading from "../../components/Loading";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../hooks/useFavorites";
import * as api from "../../services/api";

const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&q=60";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/tenant/dashboard" },
  { label: "Browse Houses", icon: Building2, to: "/houses" },
  { label: "My Bookings", icon: ClipboardList, to: "/tenant/bookings" },
  { label: "Favorites", icon: Heart, to: "/tenant/favorites" },
  { label: "Messages", icon: MessageSquare, to: "/messages" },
  { label: "Profile Settings", icon: User, to: "/tenant/profile" },
];

const BOOKING_STEPS = [
  { title: "Search House", desc: "Find your desired house using filters.", icon: Search },
  { title: "Request Booking", desc: "Send booking request to landlord.", icon: Send },
  { title: "Get Response", desc: "Landlord will review and respond.", icon: MessageCircle },
  { title: "Move In", desc: "Booking approved. Time to move in.", icon: HomeIcon },
];

const StatCard = ({ icon, label, value, color, textColor, linkColor }) => (
  <div className={`rounded-xl p-4 ${color}`}>
    <div className="flex items-center gap-2">
      {icon}
      <span className={`text-2xl font-bold ${textColor}`}>{value}</span>
    </div>
    <p className={`text-sm mt-1 ${textColor}`}>{label}</p>
    <Link to="/tenant/bookings" className={`text-xs font-medium mt-2 inline-block ${linkColor}`}>
      View all
    </Link>
  </div>
);

const buildSearchUrl = (filters) => {
  const params = new URLSearchParams();
  if (filters.location) params.set("location", filters.location);
  if (filters.propertyType) params.set("propertyType", filters.propertyType);
  if (filters.minRent) params.set("minRent", filters.minRent);
  if (filters.maxRent) params.set("maxRent", filters.maxRent);
  if (filters.bedrooms) params.set("bedrooms", filters.bedrooms);
  return `/houses?${params.toString()}`;
};

const TenantDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, canFavorite } = useFavorites();

  const [bookings, setBookings] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingSearchId, setDeletingSearchId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, housesRes, savedRes] = await Promise.all([
          api.getMyBookings(),
          api.getHouses({ available: true }),
          api.getSavedSearches(),
        ]);
        setBookings(bookingsRes.data);
        setRecommended(housesRes.data.slice(0, 4));
        setSavedSearches(savedRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteSearch = async (id) => {
    setDeletingSearchId(id);
    try {
      await api.deleteSavedSearch(id);
      setSavedSearches((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingSearchId(null);
    }
  };

  if (loading) return <Loading />;

  const pending = bookings.filter((b) => b.status === "pending").length;
  const approved = bookings.filter((b) => b.status === "approved").length;
  const closed = bookings.filter((b) => ["cancelled", "rejected"].includes(b.status)).length;

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.name || "U"
  )}&background=2563eb&color=fff`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
      {/* ---------------- Left Sidebar ---------------- */}
      <aside className="lg:w-60 flex-shrink-0">
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 flex items-center gap-3">
          <img src={avatarUrl} alt={user?.name} className="w-11 h-11 rounded-full" />
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] font-medium bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        <nav className="bg-white rounded-xl border border-gray-100 p-2">
          {NAV_ITEMS.map(({ label, icon: Icon, to }) => {
            const isActive = label === "Dashboard";
            return (
              <Link
                key={label}
                to={to}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={17} /> {label}
              </Link>
            );
          })}

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 mt-1"
          >
            <LogOut size={17} /> Logout
          </button>
        </nav>

        <div className="bg-gradient-to-b from-brand-50 to-white rounded-xl border border-gray-100 p-5 mt-4 text-center">
          <p className="text-3xl mb-2">🏡</p>
          <p className="font-semibold text-gray-800 text-sm">Find Your Dream Home</p>
          <p className="text-xs text-gray-500 mt-1 mb-3">
            Discover the best rental properties near you.
          </p>
          <Link
            to="/houses"
            className="block bg-brand-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-brand-700"
          >
            Browse Houses
          </Link>
        </div>
      </aside>

      {/* ---------------- Main Content ---------------- */}
      <main className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mb-6">Here's an overview of your rental journey.</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<FileText size={18} className="text-brand-600" />}
            label="My Bookings"
            value={bookings.length}
            color="bg-brand-50"
            textColor="text-brand-700"
            linkColor="text-brand-600"
          />
          <StatCard
            icon={<Clock size={18} className="text-amber-600" />}
            label="Pending"
            value={pending}
            color="bg-amber-50"
            textColor="text-amber-700"
            linkColor="text-amber-600"
          />
          <StatCard
            icon={<CheckCircle2 size={18} className="text-green-600" />}
            label="Approved"
            value={approved}
            color="bg-green-50"
            textColor="text-green-700"
            linkColor="text-green-600"
          />
          <StatCard
            icon={<XCircle size={18} className="text-purple-600" />}
            label="Cancelled / Rejected"
            value={closed}
            color="bg-purple-50"
            textColor="text-purple-700"
            linkColor="text-purple-600"
          />
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Recent Bookings</h2>
            <Link to="/tenant/bookings" className="text-brand-600 text-sm font-medium">
              View all
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <span className="w-12 h-12 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center mb-3">
                <Search size={20} />
              </span>
              <p className="text-gray-500 text-sm mb-4">
                You haven't made any booking requests yet.
              </p>
              <Link
                to="/houses"
                className="bg-brand-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-brand-700"
              >
                Browse Houses
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 4).map((b) => (
                <div key={b._id} className="flex items-center justify-between border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{b.house?.title}</p>
                    <p className="text-xs text-gray-400">
                      Move-in: {new Date(b.moveInDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize bg-gray-50 text-gray-600">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended For You */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Recommended For You</h2>
            <Link to="/houses" className="text-brand-600 text-sm font-medium">
              View all
            </Link>
          </div>

          {recommended.length === 0 ? (
            <p className="text-gray-500 text-sm">No houses available right now.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {recommended.map((house) => (
                <div
                  key={house._id}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    <Link to={`/houses/${house._id}`} className="block">
                      <img
                        src={house.images?.[0] || PLACEHOLDER_IMG}
                        alt={house.title}
                        className="w-full h-28 object-cover"
                      />
                    </Link>
                    {canFavorite && (
                      <button
                        onClick={() => toggleFavorite(house._id)}
                        aria-label={isFavorite(house._id) ? "Remove from favorites" : "Add to favorites"}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center hover:bg-white"
                      >
                        <Heart
                          size={14}
                          className={isFavorite(house._id) ? "fill-red-500 text-red-500" : "text-gray-400"}
                        />
                      </button>
                    )}
                  </div>
                  <Link to={`/houses/${house._id}`} className="block p-3">
                    <p className="text-sm font-medium text-gray-800 truncate">{house.title}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={11} /> {house.location?.area}, {house.location?.city}
                    </p>
                    <p className="text-brand-600 font-semibold text-sm mt-1">
                      ৳{house.rent?.toLocaleString()} <span className="text-gray-400 font-normal text-xs">/month</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {house.bedrooms} Beds · {house.bathrooms} Baths
                      {house.size ? ` · ${house.size} sq ft` : ""}
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How Booking Works */}
        <div>
          <h2 className="font-semibold text-gray-800 mb-4">How Booking Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {BOOKING_STEPS.map(({ title, desc, icon: Icon }, i) => (
              <div key={title} className="flex items-center gap-2">
                <div className="bg-white rounded-xl border border-gray-100 p-4 flex-1">
                  <span className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-2">
                    <Icon size={16} />
                  </span>
                  <p className="text-sm font-medium text-gray-800">
                    {i + 1}. {title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
                {i < BOOKING_STEPS.length - 1 && (
                  <ChevronRight size={16} className="text-gray-300 hidden sm:block flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ---------------- Right Sidebar ---------------- */}
      <aside className="lg:w-72 flex-shrink-0 space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-800 text-sm mb-3">Quick Actions</h3>
          <div className="space-y-1">
            {[
              { label: "Browse Houses", icon: Building2, to: "/houses" },
              { label: "My Bookings", icon: ClipboardList, to: "/tenant/bookings" },
              { label: "My Favorites", icon: Heart, to: "/tenant/favorites" },
              { label: "Edit Profile", icon: User, to: "/tenant/profile" },
            ].map(({ label, icon: Icon, to }) => (
              <Link
                key={label}
                to={to}
                className="flex items-center justify-between px-2 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                <span className="flex items-center gap-2">
                  <Icon size={15} /> {label}
                </span>
                <ChevronRight size={14} className="text-gray-300" />
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-red-50 rounded-xl border border-red-100 p-4">
          <h3 className="font-semibold text-red-600 text-sm mb-2 flex items-center gap-1.5">
            <Search size={14} /> Saved Searches
          </h3>

          {savedSearches.length === 0 ? (
            <>
              <p className="text-xs text-red-400 mb-2">You haven't saved any searches yet.</p>
              <button
                onClick={() => navigate("/houses")}
                className="text-xs text-red-600 font-medium hover:text-red-700"
              >
                Create Search
              </button>
            </>
          ) : (
            <div className="space-y-2">
              {savedSearches.map((s) => (
                <div key={s._id} className="flex items-center justify-between gap-2">
                  <Link
                    to={buildSearchUrl(s.filters)}
                    className="text-xs text-red-700 font-medium hover:underline truncate"
                  >
                    {s.name}
                  </Link>
                  <button
                    onClick={() => handleDeleteSearch(s._id)}
                    disabled={deletingSearchId === s._id}
                    className="text-red-400 hover:text-red-600 flex-shrink-0"
                    aria-label="Delete saved search"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
          <h3 className="font-semibold text-blue-700 text-sm mb-1">Need Help?</h3>
          <p className="text-xs text-blue-500 mb-3">We are here to help you 24/7</p>
          <p className="text-xs text-blue-700 flex items-center gap-1.5 mb-1.5">
            <Mail size={13} /> support@smartrent.com
          </p>
          <p className="text-xs text-blue-700 flex items-center gap-1.5">
            <Phone size={13} /> +880 1700 000000
          </p>
        </div>

        <div className="bg-green-50 rounded-xl border border-green-100 p-4">
          <h3 className="font-semibold text-green-700 text-sm mb-1 flex items-center gap-1.5">
            <Lightbulb size={14} /> Tips
          </h3>
          <p className="text-xs text-green-600">
            Add properties to your favorites and get notified when prices drop.
          </p>
        </div>
      </aside>
    </div>
  );
};

export default TenantDashboard;
