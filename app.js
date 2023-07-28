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

// initialize FB authentication
const auth = admin.auth();

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


// sign up route
app.post("/signup", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await auth.createUser({
        email: email,
        password: password,
    });
        res.json(user);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "An error occurred while creating a new user." });
    }
});

// sign in route
app.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await auth.signInWithEmailAndPassword(email, password);
        res.json(user);
    } catch (error) {
        console.error("Error signing in:", error);
        res.status(500).json({ error: "An error occurred while signing in." });
    }
});


  // sign out route
app.get("/signout", async (req, res) => {
    try {
        await auth.signOut();
        res.json({ message: "User signed out successfully." });
    } catch (error) {
        console.error("Error signing out:", error);
        res.status(500).json({ error: "An error occurred while signing out." });
    }
});


// using middleware to verify authentication
const isAuthenticated = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) {
        return res.status(401).json({ error: "Unauthorized: Missing token." });
    }

    admin
        .auth()
        .verifyIdToken(token)
        .then((decodedToken) => {
        req.user = decodedToken;
        next();
    })
        .catch((error) => {
        console.error("Error verifying token:", error);
        res.status(401).json({ error: "Unauthorized: Invalid token." });
    });
};

  // Using isAuthenticated middleware for specific routes that require authentication
app.get("/protected", isAuthenticated, (req, res) => {
    res.json({ message: "This is a protected route." });
});

// start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
console.log(`Server is running on port ${port}`);
});