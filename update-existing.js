const {initializeApp} = require("firebase-admin/app");
const {getAuth} = require("firebase-admin/auth");

initializeApp();

async function run() {
  // Replace this with the actual Firebase user UID from the Firebase Console.
  const uid = "USER_UID_FROM_CONSOLE";

  try {
    await getAuth().setCustomUserClaims(uid, {role: "authenticated"});
    console.log("Success! Existing user updated.");
  } catch (error) {
    console.error("Failed to update user:", error);
  }
}

run();
