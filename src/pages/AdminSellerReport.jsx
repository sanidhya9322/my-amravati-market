import React, { useEffect, useState } from "react";
import { fetchSellerResponseReport } from "../utils/sellerAnalyticsService";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

const statusConfig = {
  Good: {
    label: "Good",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  "Needs improvement": {
    label: "Needs Improvement",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  "Very slow": {
    label: "Very Slow",
    color: "bg-red-100 text-red-700",
    icon: AlertTriangle,
  },
};

const AdminSellerReport = () => {
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState([]);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const data = await fetchSellerResponseReport();

        // 🔥 Priority sort: worst sellers first
        const sorted = [...data].sort(
          (a, b) => b.deadRatio - a.deadRatio
        );

        setSellers(sorted);
      } catch (err) {
        console.error("Seller report error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, []);

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        ⏳ Loading seller response report…
      </div>
    );
  }

  if (sellers.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No seller response data available yet.
      </div>
    );
  }

  /* ================= SUMMARY ================= */
  const criticalSellers = sellers.filter(
    (s) => s.status === "Very slow"
  ).length;

  /* ================= UI ================= */
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          🧑‍💼 Seller Response Report
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Measure seller responsiveness & trust impact
        </p>
      </div>

      {/* SUMMARY ALERT */}
      {criticalSellers > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          ⚠️ {criticalSellers} seller(s) have <strong>very slow</strong> response.
          These sellers reduce buyer trust and platform retention.
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-600">
              <th className="py-3 px-4">Seller</th>
              <th className="py-3 px-4">Total Chats</th>
              <th className="py-3 px-4">Dead Chats</th>
              <th className="py-3 px-4">Dead %</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {sellers.map((seller, index) => {
              const status = statusConfig[seller.status];
              const StatusIcon = status.icon;

              return (
                <tr
                  key={seller.sellerId}
                  className="border-b last:border-none hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-4 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                        #{index + 1}
                      </span>
                      {seller.sellerName}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    {seller.totalChats}
                  </td>

                  <td className="py-3 px-4">
                    {seller.deadChats}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            seller.deadRatio > 50
                              ? "bg-red-500"
                              : seller.deadRatio > 25
                              ? "bg-yellow-400"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${seller.deadRatio}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">
                        {seller.deadRatio}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                    >
                      <StatusIcon size={14} />
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FOOTER INSIGHT */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        💡 Tip: Sellers with high dead chat ratio should be warned, guided, or
        temporarily restricted to maintain marketplace quality.
      </div>
    </div>
  );
};

export default AdminSellerReport;
