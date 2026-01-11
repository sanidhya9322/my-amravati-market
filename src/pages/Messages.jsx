import React, { useEffect, useState } from "react";
import { listenToConversations } from "../utils/chatService";
import { auth } from "../firebase/firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribeChats = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      unsubscribeChats = listenToConversations(user.uid, (chats) => {
        const sorted = [...chats].sort(
          (a, b) =>
            (b.lastMessageAt?.seconds || 0) -
            (a.lastMessageAt?.seconds || 0)
        );
        setConversations(sorted);
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeChats) unsubscribeChats();
    };
  }, [navigate]);

  const currentUserId = auth.currentUser?.uid;

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading conversations...
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">💬 Messages</h1>

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
                className={`block bg-white p-4 sm:p-5 rounded-xl border transition
                  ${
                    isUnread
                      ? "border-blue-200 shadow-sm"
                      : "border-gray-100"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={chat.productImage || "/placeholder.png"}
                    alt="product"
                    className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold line-clamp-1">
                      {chat.productTitle}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {chat.lastMessage || "Say hi 👋"}
                    </p>
                  </div>

                  {isUnread && (
                    <span className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
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
