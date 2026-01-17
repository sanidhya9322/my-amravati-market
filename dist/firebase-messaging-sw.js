importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCcMTrPRrddN84zbsoZZtKQ068wqOYJelY",
  authDomain: "myamravati-market-17248.firebaseapp.com",
  projectId: "myamravati-market-17248",
  messagingSenderId: "390266313293",
  appId: "1:390266313293:web:fe9ecb9eae7bcd05361a04"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background message", payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo192.png",
  });
});
