import React, { useEffect, useState } from "react";
import { listenToConversations } from "../utils/chatService";
import { auth } from "../firebase/firebaseConfig";
import { Link, useNavigate } from "react-router-dom";

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
      return;
    }

    const unsubscribe = listenToConversations(user.uid, (chats) => {
      const sorted = [...chats].sort(
        (a, b) =>
          (b.lastMessageAt?.seconds || 0) -
          (a.lastMessageAt?.seconds || 0)
      );
      setConversations(sorted);
    });

    return () => unsubscribe && unsubscribe();
  }, [navigate]);

  const currentUserId = auth.currentUser?.uid;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">💬 Messages</h1>

      {/* ================= EMPTY STATE ================= */}
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-24 text-center">
          <div className="bg-blue-50 p-6 rounded-full mb-5">
            <span className="text-4xl">💬</span>
          </div>

          <h2 className="text-lg font-semibold text-gray-800">
            No conversations yet
          </h2>

          <p className="text-gray-500 max-w-sm mt-2 text-sm">
            When you contact a seller or someone messages you about your
            product, conversations will appear here.
          </p>

          <Link
            to="/browse"
            className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        /* ================= CONVERSATION LIST ================= */
        <div className="space-y-4">
          {conversations.map((chat) => {
            const isUnread =
              currentUserId === chat.buyerId
                ? chat.buyerUnread > 0
                : chat.sellerUnread > 0;

            return (
              <Link
                key={chat.id}
                to={`/messages/${chat.id}`}
                className={`block bg-white p-4 sm:p-5 rounded-xl border transition-all duration-200
                  ${
                    isUnread
                      ? "border-blue-200 shadow-sm hover:shadow-md"
                      : "border-gray-100 hover:shadow-sm"
                  }`}
              >
                <div className="flex items-center gap-4">
                  {/* Product Image */}
                  <img
                    src={chat.productImage || "/placeholder.png"}
                    alt="product"
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                  />

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm sm:text-base line-clamp-1 ${
                        isUnread
                          ? "font-semibold text-gray-900"
                          : "font-medium text-gray-800"
                      }`}
                    >
                      {chat.productTitle}
                    </p>

                    <p
                      className={`text-xs sm:text-sm line-clamp-1 mt-1 ${
                        isUnread
                          ? "text-blue-600 font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      {chat.lastMessage || "Say hi 👋"}
                    </p>
                  </div>

                  {/* Unread Dot */}
                  {isUnread && (
                    <span className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default Messages;
