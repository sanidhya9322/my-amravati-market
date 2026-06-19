import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissedUntil = localStorage.getItem(
      "installPromptDismissed"
    );

    if (
      dismissedUntil &&
      Number(dismissedUntil) > Date.now()
    ) {
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      setTimeout(() => {
        setVisible(true);
      }, 5000);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handler
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handler
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const result = await deferredPrompt.userChoice;

    if (result.outcome === "accepted") {
      setVisible(false);
    }
  };

  const handleClose = () => {
    const sevenDays =
      Date.now() + 7 * 24 * 60 * 60 * 1000;

    localStorage.setItem(
      "installPromptDismissed",
      sevenDays.toString()
    );

    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[95%] max-w-md">
      <div className="bg-white rounded-3xl shadow-2xl border p-5">

        <button
          onClick={handleClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-xl"
        >
          ×
        </button>

        <div className="flex items-center gap-3">
          <div className="text-3xl">
            📲
          </div>

          <div>
            <h3 className="font-bold text-lg">
              Install MyAmravati
            </h3>

            <p className="text-sm text-gray-500">
              Faster access from your home screen
            </p>
          </div>
        </div>

        <div className="mt-4 bg-blue-50 rounded-xl p-3 text-sm text-gray-700">
          📦 Browse products faster<br />
          📶 Works even on weak internet<br />
          🚀 One tap access anytime
        </div>

        <button
          onClick={handleInstall}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
        >
          Install App
        </button>

        <button
          onClick={handleClose}
          className="w-full mt-2 text-sm text-gray-500"
        >
          Maybe Later
        </button>

      </div>
    </div>
  );
}