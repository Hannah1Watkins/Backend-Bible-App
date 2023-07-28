const express = require("express");
const admin = require("firebase-admin");
const serviceAccount = require("/Users/Hannah/ada/capstone/backend_bible_app/bible-app-f6a3f-firebase-adminsdk-c0zik-ef91fdd9f6.json");
const axios = require("axios");


// initialize express app
const app = express();

// initialize Firebase Admin SDK
admin.initializeApp({
credential: admin.credential.cert(serviceAccount),
databaseURL: "https://bible-app-f6a3f-default-rtdb.firebaseio.com/"
});

// Define routes

app.get("/generate", async (req, res) => {
    try {
      // extract keyword or topic from query parameters
        const { keyword, topic } = req.query;

      // validate that either keyword or topic is provided
        if (!keyword && !topic) {
        return res.status(400).json({ error: "Please provide a keyword or topic." });
    }

    //defining api url for getting Bible verses
    const apiUrl = "https://scripture.api.bible/admin";


    //GET request to Bible api w/ keyword/topic as query peram
        const response = await axios.get(apiUrl, {
        params: {
            keyword: keyword,
            topic: topic,
        },
    });

    const verses = response.data;

    // Save fetched verses to Firebase Realtime Database
    const databaseRef = admin.database().ref("verses");
    verses.forEach((verse) => {
        databaseRef.push(verse);
    });

    // Return generated verses as response
    res.json(verses);
    } catch (error) {
    console.error("Error generating Bible verses:", error);
    res.status(500).json({ error: "An error occurred while generating Bible verses." });
    }
});

// start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
console.log(`Server is running on port ${port}`);
});

//verses route
app.get("/verses", async (req, res) => {
    //retrieving saved veres for specific user from Realtime DB 
    try {
        const userId = req.user.id;
        const databaseRef = admin.database().ref(`users/${userId}/verses`);
        const snapshot = await databaseRef.once("value");
        const savedVerses = snapshot.val();

        // return saved verses as response
        res.json(savedVerses);
    } catch (error) {
        console.error("Error retrieving saved Bible verses:", error);
        res.status(500).json({ error: "An error occurred while retrieving saved Bible verses." });
    }
});


