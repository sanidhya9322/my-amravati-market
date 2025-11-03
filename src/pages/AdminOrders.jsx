import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const querySnapshot = await getDocs(collection(db, "orders"));
      setOrders(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchOrders();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📦 Orders</h1>
      <div className="bg-white shadow rounded p-4">
        {orders.length === 0 ? (
          <p className="text-gray-600">No orders yet.</p>
        ) : (
          <ul>
            {orders.map((order) => (
              <li key={order.id} className="border-b py-2">
                <p>
                  <strong>Buyer:</strong> {order.buyerEmail}
                </p>
                <p>
                  <strong>Product:</strong> {order.productTitle}
                </p>
                <p>
                  <strong>Status:</strong> {order.status || "Pending"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
