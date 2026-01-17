import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import { listenToMessages, sendMessage, deleteMessageForMe, deleteMessageForEveryone } from "../utils/chatService";
import { doc, updateDoc, getDoc } from "firebase/firestore";

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [convoData, setConvoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [longPressedMsg, setLongPressedMsg] = useState(null);
  const pressTimer = useRef(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const startPress = (msgId) => {
    pressTimer.current = setTimeout(() => {
      setLongPressedMsg(msgId);
    }, 600); 
  };

  const cancelPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    
    const messageText = text.trim();
    if (!messageText || convoData?.isBlocked || sending) return;

    // 1. Clear input immediately to avoid confusion
    setSending(true);
    setText(""); 

    try {
      await sendMessage(conversationId, auth.currentUser.uid, messageText);
      
      // 2. Refocus after DOM update
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);

    } catch (err) {
      console.error("Send message failed:", err);
      setText(messageText); 
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading chat…</div>;
  }

  return (
    <div className="max-w-4xl mx-auto h-[85vh] flex flex-col bg-white border rounded-xl shadow-sm mt-4">
      {/* 🔹 HEADER */}
      <div className="border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-black mr-2">←</button>
        <img
          src={convoData?.productImage || "/placeholder.png"}
          alt="Product"
          className="w-10 h-10 rounded-lg object-cover bg-gray-100"
        />
        <div>
          <p className="font-semibold text-sm line-clamp-1">{convoData?.productTitle || "Product Inquiry"}</p>
          <p className="text-xs text-gray-500">🔒 Secure chat</p>
        </div>
      </div>

      {convoData?.isBlocked && (
        <div className="bg-red-50 text-red-600 text-xs text-center py-2 mx-4 mt-2 rounded">
          This conversation has been blocked.
        </div>
      )}

      {/* 🔹 MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" onClick={() => setLongPressedMsg(null)}>
        {messages.map((msg) => {
          const isMe = msg.senderId === auth.currentUser.uid;
          
          let showDeletedText = false;
          if (msg.isDeleted) {
            if (msg.deletedFor === "everyone") showDeletedText = true;
            if (msg.deletedFor === "me" && msg.deletedBy === auth.currentUser.uid) showDeletedText = true;
          }

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <div
                onMouseDown={() => startPress(msg.id)}
                onMouseUp={cancelPress}
                onMouseLeave={cancelPress}
                onTouchStart={() => startPress(msg.id)}
                onTouchEnd={cancelPress}
                className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm shadow-sm cursor-pointer select-none ${
                  isMe
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-800 rounded-bl-sm"
                }`}
              >
                {showDeletedText ? (
                  <p className={`italic text-xs ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                    🗑️ This message was deleted
                  </p>
                ) : (
                  <p>{msg.text}</p>
                )}

                <span className={`block text-[10px] mt-1 text-right ${isMe ? "text-blue-100" : "text-gray-400"}`}>
                  {msg.createdAt?.toDate 
                    ? msg.createdAt.toDate().toLocaleTimeString([], { 
                        hour: "2-digit", 
                        minute: "2-digit", 
                        hour12: true // 🔹 Yeh 12-hour format enable karta hai
                      }) 
                    : "..."}
                </span>
              </div>

              {longPressedMsg === msg.id && isMe && !msg.isDeleted && (
                <div className="bg-white border rounded-lg shadow-md mt-1 p-2 flex gap-3 text-xs z-10">
                  <button
                    onClick={() => {
                      deleteMessageForMe(conversationId, msg.id, auth.currentUser.uid);
                      setLongPressedMsg(null);
                    }}
                    className="text-gray-600 hover:text-black"
                  >
                    🗑️ Delete for me
                  </button>
                  <button
                    onClick={() => {
                      deleteMessageForEveryone(conversationId, msg.id, auth.currentUser.uid);
                      setLongPressedMsg(null);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    🚫 Delete for everyone
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 🔹 INPUT */}
      <form onSubmit={handleSend} className="border-t px-4 py-3 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={convoData?.isBlocked || sending}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={!text.trim() || convoData?.isBlocked || sending}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-full text-sm font-semibold transition"
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
};

export default Chat;