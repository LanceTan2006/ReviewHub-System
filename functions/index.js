const {onCreate} = require("firebase-functions/v2/auth");
const {initializeApp} = require("firebase-admin/app");
const {getAuth} = require("firebase-admin/auth");

initializeApp();

exports.setAuthenticatedRole = onCreate(async (event) => {
  const user = event.data;

  try {
    await getAuth().setCustomUserClaims(user.uid, {role: "authenticated"});
    console.log(`Set "authenticated" claim for user: ${user.uid}`);
  } catch (error) {
    console.error("Error setting custom claim:", error);
  }
});
