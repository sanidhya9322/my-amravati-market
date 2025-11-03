// setAdmin.js (server-side script using Firebase Admin SDK)
import admin from "firebase-admin";
import { readFileSync } from "fs";

// Load the service account key
const serviceAccount = JSON.parse(
  readFileSync("./serviceAccountKey.json", "utf8")
);

// Initialize Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Replace with your actual user UID
const ADMIN_UID = "ocmPSDHBa1RmELR0MXENQTtwNJx1";

async function setAdminFlag() {
  try {
    await db.collection("users").doc(ADMIN_UID).set(
      {
        role: "admin",
      },
      { merge: true }
    );
    console.log("✅ Admin flag set successfully!");
  } catch (error) {
    console.error("❌ Error setting admin flag:", error);
  }
}

setAdminFlag();
