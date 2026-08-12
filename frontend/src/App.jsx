import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Houses from "./pages/Houses";
import HouseDetails from "./pages/HouseDetails";

import TenantDashboard from "./pages/tenant/TenantDashboard";
import MyBookings from "./pages/tenant/MyBookings";
import Profile from "./pages/tenant/Profile";
import Favorites from "./pages/tenant/Favorites";
import Messages from "./pages/Messages";

import LandlordDashboard from "./pages/landlord/LandlordDashboard";
import AddHouse from "./pages/landlord/AddHouse";
import MyHouses from "./pages/landlord/MyHouses";
import EditHouse from "./pages/landlord/EditHouse";
import BookingRequests from "./pages/landlord/BookingRequests";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/houses" element={<Houses />} />
          <Route path="/houses/:id" element={<HouseDetails />} />

          {/* Tenant routes */}
          <Route
            path="/tenant/dashboard"
            element={
              <ProtectedRoute allowedRoles={["tenant"]}>
                <TenantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant/bookings"
            element={
              <ProtectedRoute allowedRoles={["tenant"]}>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant/profile"
            element={
              <ProtectedRoute allowedRoles={["tenant", "landlord"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant/favorites"
            element={
              <ProtectedRoute allowedRoles={["tenant"]}>
                <Favorites />
              </ProtectedRoute>
            }
          />

          {/* Shared routes (both roles) */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute allowedRoles={["tenant", "landlord"]}>
                <Messages />
              </ProtectedRoute>
            }
          />

          {/* Landlord routes */}
          <Route
            path="/landlord/dashboard"
            element={
              <ProtectedRoute allowedRoles={["landlord"]}>
                <LandlordDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/landlord/add-house"
            element={
              <ProtectedRoute allowedRoles={["landlord"]}>
                <AddHouse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/landlord/my-houses"
            element={
              <ProtectedRoute allowedRoles={["landlord"]}>
                <MyHouses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/landlord/edit-house/:id"
            element={
              <ProtectedRoute allowedRoles={["landlord"]}>
                <EditHouse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/landlord/requests"
            element={
              <ProtectedRoute allowedRoles={["landlord"]}>
                <BookingRequests />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="text-center py-24 text-gray-500">
                <p className="text-2xl font-bold mb-2">404</p>
                <p>Page not found</p>
              </div>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
