import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../services/api";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ type: "", text: "" });
    try {
      const payload = { name, phone };
      if (password) payload.password = password;

      const { data } = await api.updateProfile(payload);

      const updated = { ...user, name: data.name, phone: data.phone };
      localStorage.setItem("smartrent_user", JSON.stringify(updated));
      setUser(updated);

      setStatus({ type: "success", text: "Profile updated successfully!" });
      setPassword("");
    } catch (err) {
      setStatus({ type: "error", text: err.response?.data?.message || "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">My Profile</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {status.text && (
          <div
            className={`mb-4 text-sm rounded-lg px-3 py-2 ${
              status.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
            }`}
          >
            {status.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              value={user?.email}
              disabled
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">New Password (optional)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
