import { Link, useNavigate } from "react-router-dom";
import { Home, LogOut, LayoutDashboard, Building2, MessageSquare } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const dashboardPath = user?.role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-bold text-brand-600 text-xl">
          <Home size={22} />
          Smart Rent
        </Link>

        <div className="flex items-center gap-4 text-sm font-medium">
          <Link to="/houses" className="text-gray-600 hover:text-brand-600 flex items-center gap-1">
            <Building2 size={16} /> Browse Houses
          </Link>

          {user ? (
            <>
              <Link to={dashboardPath} className="text-gray-600 hover:text-brand-600 flex items-center gap-1">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link to="/messages" className="text-gray-600 hover:text-brand-600 flex items-center gap-1">
                <MessageSquare size={16} /> Messages
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-700">Hi, {user.name.split(" ")[0]}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-red-500 hover:text-red-700"
              >
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-brand-600">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
