import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "./firebaseConfig";

const messaging = getMessaging(app);

export const requestPermissionAndToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const token = await getToken(messaging, {
      vapidKey: "BM2wzxG01q8tnlhLliqbUFW_nO5tuqBhau4GoFsjVar-yOSnwhABXB2Rsv9kYr8FGQIIeFcGpZ5-wBn12ijeXJk",
    });

    return token;
  } catch (err) {
    console.error("FCM error:", err);
    return null;
  }
};

export const onForegroundMessage = (callback) => {
  onMessage(messaging, callback);
};
