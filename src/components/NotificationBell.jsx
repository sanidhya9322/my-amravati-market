import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { auth } from "../firebase/firebaseConfig";
import {
  listenToNotifications,
  markNotificationRead,
} from "../utils/notificationService";
import { useNavigate } from "react-router-dom";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsub = listenToNotifications(user.uid, setNotifications);
    return () => unsub && unsub();
  }, []);

  const handleClick = async (n) => {
    await markNotificationRead(auth.currentUser.uid, n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative">
      {/* 🔔 Bell */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <Bell size={22} />

        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {/* 📦 Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-xl shadow-lg z-50">
          <div className="p-3 border-b font-semibold">
            Notifications
          </div>

          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">
              No new notifications
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className="p-3 text-sm cursor-pointer hover:bg-gray-50 border-b last:border-none"
              >
                <p className="font-medium">{n.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {n.message}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
