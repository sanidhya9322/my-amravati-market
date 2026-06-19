import React from "react";

const Offline = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
        <div className="text-5xl mb-4">📡</div>

        <h1 className="text-2xl font-bold mb-3">
          You're Offline
        </h1>

        <p className="text-gray-600 mb-6">
          Internet connection not detected.
          Please reconnect and try again.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default Offline;