import React, { useEffect, useState } from "react";
import { fetchChatAnalytics } from "../utils/analyticsService";
import { MessageCircle, Clock, AlertTriangle, Flame } from "lucide-react";

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await fetchChatAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error("Analytics error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        ⏳ Loading admin analytics…
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8 text-center text-red-600">
        ❌ Failed to load analytics data.
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          📊 Admin Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Platform communication & engagement insights
        </p>
      </div>

      {/* ================= METRICS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard
          icon={MessageCircle}
          title="Total Conversations"
          value={analytics.totalConversations}
          description="Chats initiated on platform"
          color="blue"
        />

        <MetricCard
          icon={AlertTriangle}
          title="Dead Conversations"
          value={analytics.deadConversations}
          description="No reply in last 24 hours"
          color={analytics.deadConversations > 0 ? "red" : "green"}
        />

        <MetricCard
          icon={Clock}
          title="Avg Seller Response"
          value={
            analytics.avgSellerResponseMinutes
              ? `${analytics.avgSellerResponseMinutes} min`
              : "N/A"
          }
          description="Average first reply time"
          color="indigo"
        />
      </div>

      {/* ================= TOP PRODUCTS ================= */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="text-orange-500" />
          <h2 className="text-lg font-semibold">
            Top Products by Conversations
          </h2>
        </div>

        {analytics.topProducts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No chat activity data available yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-3">Product</th>
                  <th className="py-3 text-right">Chats</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topProducts.map((p, i) => (
                  <tr
                    key={p.productId}
                    className="border-b last:border-none hover:bg-gray-50 transition"
                  >
                    <td className="py-3 font-medium text-gray-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                          #{i + 1}
                        </span>
                        {p.productTitle || "Unnamed product"}
                      </div>
                    </td>
                    <td className="py-3 text-right font-semibold">
                      {p.chatCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= FUTURE INSIGHT NOTE ================= */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        💡 Tip: High chat but low conversions usually indicate pricing,
        trust, or seller response issues.
      </div>
    </div>
  );
};

/* ================= METRIC CARD ================= */
const MetricCard = ({ icon: Icon, title, value, description, color }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50",
    red: "text-red-600 bg-red-50",
    green: "text-green-600 bg-green-50",
    indigo: "text-indigo-600 bg-indigo-50",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}
      >
        <Icon size={20} />
      </div>

      <p className="text-sm text-gray-500 mt-3">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
  );
};

export default AdminAnalytics;
