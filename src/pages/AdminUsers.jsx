import React, { useEffect, useMemo, useState } from "react";
import { db, auth } from "../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { Shield, Store, UserX, UserCheck } from "lucide-react";
import toast from "react-hot-toast";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const currentAdminId = auth.currentUser?.uid;

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        setUsers(
          snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  /* ================= ACTIONS ================= */
  const changeRole = async (userId, newRole) => {
    if (userId === currentAdminId) {
      toast.error("You cannot change your own role");
      return;
    }

    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: newRole } : u
        )
      );
      toast.success(`Role updated to ${newRole}`);
    } catch {
      toast.error("Failed to update role");
    }
  };

  const toggleBlock = async (user) => {
    if (user.id === currentAdminId) {
      toast.error("You cannot block yourself");
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.id), {
        isBlocked: !user.isBlocked,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, isBlocked: !u.isBlocked }
            : u
        )
      );

      toast.success(
        user.isBlocked ? "User unblocked" : "User blocked"
      );
    } catch {
      toast.error("Action failed");
    }
  };

  /* ================= FILTER ================= */
  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const s = search.toLowerCase();
    return users.filter(
      (u) =>
        u.email?.toLowerCase().includes(s) ||
        u.name?.toLowerCase().includes(s) ||
        u.role?.toLowerCase().includes(s)
    );
  }, [users, search]);

  /* ================= UI ================= */
  if (loading) return <p className="text-gray-500">Loading users…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">👥 Users</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name / email / role"
          className="px-3 py-2 border rounded-lg text-sm w-64"
        />
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">
                  <p className="font-semibold">{u.name || "—"}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </td>

                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      u.role === "admin"
                        ? "bg-indigo-100 text-indigo-700"
                        : u.role === "seller"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {u.role || "user"}
                  </span>
                </td>

                <td className="p-3 text-center text-xs">
                  {u.isBlocked ? (
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                      Blocked
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                      Active
                    </span>
                  )}
                </td>

                <td className="p-3 flex gap-2 justify-center flex-wrap">
                  {u.role !== "seller" && (
                    <button
                      onClick={() => changeRole(u.id, "seller")}
                      className="px-2 py-1 text-xs bg-yellow-500 text-white rounded"
                    >
                      <Store size={14} /> Seller
                    </button>
                  )}

                  {u.role !== "admin" && (
                    <button
                      onClick={() => changeRole(u.id, "admin")}
                      className="px-2 py-1 text-xs bg-indigo-600 text-white rounded"
                    >
                      <Shield size={14} /> Admin
                    </button>
                  )}

                  <button
                    onClick={() => toggleBlock(u)}
                    className={`px-2 py-1 text-xs rounded ${
                      u.isBlocked
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {u.isBlocked ? (
                      <>
                        <UserCheck size={14} /> Unblock
                      </>
                    ) : (
                      <>
                        <UserX size={14} /> Block
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="p-6 text-center text-gray-500"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
