import { useState, useEffect } from "react";
import { User, Edit, Trash2, Lock, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const getToken = () => localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch users");
      }

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Fetch users error:", err);
      setMessage({
        type: "error",
        text: err.message || "Failed to load users. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete user");
      }

      setUsers(users.filter((user) => user._id !== id));
      setMessage({ type: "success", text: "User deleted successfully" });
    } catch (err) {
      console.error("Delete error:", err);
      setMessage({
        type: "error",
        text: err.message || "Failed to delete user. Please try again."
      });
    }

    setTimeout(() => setMessage(null), 5000);
  };

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          isAllowed: !currentStatus
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update user status");
      }

      const updatedUser = await res.json();
      setUsers(
        users.map((user) =>
          user._id === id ? { ...user, isAllowed: updatedUser.isAllowed } : user
        )
      );
      setMessage({
        type: "success",
        text: `User ${updatedUser.isAllowed ? "enabled" : "disabled"} successfully`
      });
    } catch (err) {
      console.error("Status toggle error:", err);
      setMessage({
        type: "error",
        text: err.message || "Failed to update user status"
      });
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userFullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <div className="ml-0 md:ml-64 transition-all duration-300">
      <div className="max-w-5xl mx-auto mt-10 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400">👥 Users Management</h2>
          <Link
            to="/users/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Plus size={18} />
            Add User
          </Link>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl text-white font-medium shadow-md ${message.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}>
            {message.text}
          </div>
        )}

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              className="w-full p-3 pl-10 rounded-2xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-3.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
  <table className="w-full border-collapse">
    <thead>
      <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
        <th className="p-3 text-left">Picture</th>
        <th className="p-3 text-left">Username</th>
        <th className="p-3 text-left">Full Name</th>
        <th className="p-3 text-left">Role</th>
        <th className="p-3 text-left">Status</th>
        <th className="p-3 text-left">Created At</th>
        <th className="p-3 text-left">Actions</th>
      </tr>
    </thead>
    <tbody>
      {filteredUsers.length > 0 ? (
        filteredUsers.map((user) => (
          <tr key={user._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
            <td className="p-3">
              {user.userPicture ? (
                <img
                  src={`http://localhost:5000${user.userPicture}`}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/40";
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <User className="text-gray-400" size={20} />
                </div>
              )}
            </td>
            <td className="p-3 font-medium text-gray-800 dark:text-gray-200">{user.username}</td>
            <td className="p-3 text-gray-800 dark:text-gray-200">{user.userFullName || '-'}</td>
            <td className="p-3">
              <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                {user.role}
              </span>
            </td>
            <td className="p-3">
              <button
                onClick={() => toggleUserStatus(user._id, user.isAllowed)}
                className={`px-2 py-1 rounded-full text-xs cursor-pointer ${user.isAllowed
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
              >
                {user.isAllowed ? 'Active' : 'Inactive'}
              </button>
            </td>
            <td className="p-3 text-sm text-gray-500 dark:text-gray-400">
              {new Date(user.createdAt).toLocaleDateString()}
            </td>
            <td className="p-3 flex gap-2">
              <Link
                to={`/users/edit/${user._id}`}
                className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700 rounded-lg"
                title="Edit"
              >
                <Edit size={18} />
              </Link>
              <Link
                to={`/users/change_password/${user._id}`}
                className="p-2 text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg"
                title="Change Password"
              >
                <Lock size={18} />
              </Link>
              <button
                onClick={() => handleDelete(user._id)}
                className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700 rounded-lg"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="7" className="p-4 text-center text-gray-500 dark:text-gray-400">
            {searchTerm ? "No matching users found" : "No users found"}
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
      </div>
    </div>
  );
};

export default Users;
