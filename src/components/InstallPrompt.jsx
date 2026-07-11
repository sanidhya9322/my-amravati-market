import { useEffect, useState } from "react";
import { trackEvent } from "../utils/metaPixel";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // CHANGE 3: Check agar app pehle se hi install ho chuki hai
    const isAlreadyInstalled = localStorage.getItem("appInstalledSuccessfully");
    if (isAlreadyInstalled === "true") {
      return; // Agar installed hai, toh aage ka koi listener mat lagao
    }

    // Purana 7-day cooldown check
    const dismissedUntil = localStorage.getItem("installPromptDismissed");
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // CHANGE 1: Delay ko 5 second se badhakar 60 second (60000ms) kar diya hai
      setTimeout(() => {
        setVisible(true);
      }, 60000); 
    };

    // CHANGE 2: Browser se direct installation handle karne ke liye listener
    const handleAppInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
      
      // localStorage mein save kar rahe hain taaki dobara prompt na dikhe
      localStorage.setItem("appInstalledSuccessfully", "true");

      trackEvent("InstallApp", {
        source: "BrowserUI",
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;

    if (result.outcome === "accepted") {
      // User ne button click karke install kiya, toh localStorage set karo
      localStorage.setItem("appInstalledSuccessfully", "true");

      trackEvent("InstallApp", {
        source: "PWA_Button",
      });
    }

    setDeferredPrompt(null);
    setVisible(false);
  };

  const handleClose = () => {
    const sevenDays = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem("installPromptDismissed", sevenDays.toString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[95%] max-w-md">
      <div className="bg-white rounded-3xl shadow-2xl border p-5">
        <button
          onClick={handleClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-xl"
          aria-label="Close install prompt"
        >
          ×
        </button>

        <div className="flex items-center gap-3">
          <div className="text-3xl">📲</div>
          <div>
            <h3 className="font-bold text-lg">Install MyAmravati</h3>
            <p className="text-sm text-gray-500">Faster access from your home screen</p>
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
          className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}