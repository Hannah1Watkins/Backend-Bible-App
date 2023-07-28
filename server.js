const express = require("express");
const admin = require("firebase-admin");
const serviceAccount = require("/Users/Hannah/ada/capstone/backend_bible_app/bible-app-f6a3f-firebase-adminsdk-c0zik-ef91fdd9f6.json");
const axios = require("axios");


// Initialize express app
const app = express();

// Initialize Firebase Admin SDK
admin.initializeApp({
credential: admin.credential.cert(serviceAccount),
databaseURL: "https://bible-app-f6a3f-default-rtdb.firebaseio.com/"
});

// Define routes
app.get("/generate", (req, res) => {
  // Handle generating new Bible verses based on keyword/topic input
  // Retrieve relevant verses from the Bible API and save them to the database
  // Return the generated verses as a response
});

app.get("/verses", (req, res) => {
  // Handle retrieving saved Bible verses for a specific user
  // Return the saved verses as a response
});


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
console.log(`Server is running on port ${port}`);
});

