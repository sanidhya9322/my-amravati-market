import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import { listenToMessages, sendMessage } from "../utils/chatService";
import { doc, updateDoc, getDoc } from "firebase/firestore";

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [convoData, setConvoData] = useState(null);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  /* 🔹 Auto scroll */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* 🔹 Initial setup */
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
      return;
    }

    const initChat = async () => {
      try {
        const convoRef = doc(db, "conversations", conversationId);
        const snap = await getDoc(convoRef);

        if (!snap.exists()) {
          navigate("/messages");
          return;
        }

        const data = snap.data();
        setConvoData(data);

        // Reset unread counts
        if (data.buyerId === user.uid && data.buyerUnread > 0) {
          await updateDoc(convoRef, { buyerUnread: 0 });
        }
        if (data.sellerId === user.uid && data.sellerUnread > 0) {
          await updateDoc(convoRef, { sellerUnread: 0 });
        }
      } catch (err) {
        console.error("Chat init error:", err);
      } finally {
        setLoading(false);
      }
    };

    initChat();
    const unsubscribe = listenToMessages(conversationId, setMessages);
    return () => unsubscribe && unsubscribe();
  }, [conversationId, navigate]);

  /* 🔹 Send message */
  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || convoData?.isBlocked) return;

    try {
      await sendMessage(conversationId, auth.currentUser.uid, text.trim());
      setText("");
    } catch (err) {
      console.error("Send message failed:", err);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading chat…</div>;
  }

  return (
    <div className="max-w-4xl mx-auto h-[85vh] flex flex-col bg-white border rounded-xl shadow-sm mt-4">
      
      {/* 🔹 3️⃣ UPDATED HEADER (Context = Trust) */}
      <div className="border-b px-4 pb-3 pt-3 mb-1 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-black mr-2"
        >
          ←
        </button>
        
        <img
          src={convoData?.productImage || "/placeholder.png"}
          alt="Product"
          className="w-10 h-10 rounded-lg object-cover bg-gray-100"
        />
        
        <div>
          <p className="font-semibold text-sm line-clamp-1">
            {convoData?.productTitle || "Product Inquiry"}
          </p>
          <p className="text-xs text-gray-500">🔒 Secure chat</p>
        </div>
      </div>

      {/* 🔹 BLOCK NOTICE */}
      {convoData?.isBlocked && (
        <div className="bg-red-50 text-red-600 text-xs text-center py-2 mx-4 mb-2 rounded">
          This conversation has been blocked.
        </div>
      )}

      {/* 🔹 MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.senderId === auth.currentUser.uid;

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              {/* 🔹 1️⃣ UPDATED BUBBLE CLASSES (Asymmetry) */}
              <div
                className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm leading-relaxed shadow-sm ${
                  isMe
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-800 rounded-bl-sm"
                }`}
              >
                <p>{msg.text}</p>

                {/* 🔹 2️⃣ UPDATED TIMESTAMP (Inside bubble) */}
                <span
                  className={`block text-[10px] mt-1 text-right ${
                    isMe ? "text-blue-100" : "text-gray-400"
                  }`}
                >
                  {msg.createdAt?.toDate
                    ? msg.createdAt.toDate().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "..."}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 🔹 INPUT AREA */}
      <form
        onSubmit={handleSend}
        className="border-t px-4 py-3 flex gap-2"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={convoData?.isBlocked}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={!text.trim() || convoData?.isBlocked}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-full text-sm font-semibold transition"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;