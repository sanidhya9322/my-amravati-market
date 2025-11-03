import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { Shield, Store } from "lucide-react";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUsers(data);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Promote user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      alert(`User role updated to "${newRole}" successfully!`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role.");
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Registered Users</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg shadow-sm">
          <thead>
            <tr className="bg-indigo-100 text-left text-gray-700">
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Current Role</th>
              <th className="py-2 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4">{u.name || "—"}</td>
                <td className="py-2 px-4">{u.email || "—"}</td>
                <td className="py-2 px-4 capitalize">{u.role || "user"}</td>
                <td className="py-2 px-4 text-center">
                  <div className="flex gap-2 justify-center">
                    {u.role !== "seller" && (
                      <button
                        onClick={() => handleRoleChange(u.id, "seller")}
                        className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                      >
                        <Store size={16} /> Make Seller
                      </button>
                    )}
                    {u.role !== "admin" && (
                      <button
                        onClick={() => handleRoleChange(u.id, "admin")}
                        className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition"
                      >
                        <Shield size={16} /> Make Admin
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
