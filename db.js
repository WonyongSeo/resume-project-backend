const firebase = require("firebase-admin");
const config = require("./config");
 
const serviceAccount = require("./serviceAccountKey.json");

const db = firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://thesedays-resume-default-rtdb.firebaseio.com/",
});

// const db = firebase.initializeApp(config.firebaseConfig);
 
module.exports = {
    db,
};