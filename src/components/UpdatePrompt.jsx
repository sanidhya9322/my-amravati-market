import { useRegisterSW } from "virtual:pwa-register/react";

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 9999,
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 5px 20px rgba(0,0,0,0.15)",
      }}
    >
      <h6>🚀 New version available</h6>

      <div className="d-flex gap-2 mt-2">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => updateServiceWorker(true)}
        >
          Update
        </button>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setNeedRefresh(false)}
        >
          Later
        </button>
      </div>
    </div>
  );
}