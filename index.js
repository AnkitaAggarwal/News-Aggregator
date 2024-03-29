const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// In-memory data store for users and their preferences
const users = [];
const preferences = new Map();



const cacher = require('./cacher.js');


// To query /v2/top-headlines
// All options passed to topHeadlines are optional, but you need to include at least one of them
var asyncFetchHeadlines = async (query, userPreferences) => {

  const articles = await cacher.getCachedArticlesByPreferences(query, userPreferences);
  return articles
}

// Helper function to generate JWT
function generateToken(user) {
  return jwt.sign({ userId: user.id }, process.env.secret_key, { expiresIn: '1h' });
}

// Helper function to verify JWT #midleware
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Not Authorized' });
  }

  jwt.verify(token, process.env.secret_key, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Error in Authorization' });
    }

    req.userId = decoded.userId;
    next();
  });
}


// Register a new user
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate the request
    if (!username || !password) {
      return res.status(400).json({ message: 'Invalid request - username or password is missing' });
    }

    // Check if the user already exists
    const userExists = users.find(user => user.username === username);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = { id: users.length + 1, username, password: hashedPassword };
    users.push(user);

    res.status(200).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error. Please try again later' });
  }
});

// Log in a user
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate the request
    if (!username || !password) {
      return res.status(400).json({ message: 'Invalid request - username or password is missing' });
    }

    // Find the user
    const user = users.find(user => user.username === username);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Verify the password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT
    const token = generateToken(user);

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
    console.log(error);
  }
});

// Retrieve the news preferences for the logged-in user
app.get('/preferences', verifyToken, (req, res) => {
  const userPreferences = preferences.get(req.userId);

  if (!userPreferences) {
    return res.status(200).json({ preferences : {}});
  }

  res.status(200).json({ preferences: userPreferences });
});

// Update the news preferences for the logged-in user
app.put('/preferences', verifyToken, (req, res) => {
  const updatedPreferences = req.body.preferences;

  if (!updatedPreferences) {
    return res.status(400).json({ message: 'Preferences not found' });
  }

  if (Object.keys(updatedPreferences).length === 0 || !updatedPreferences.category) {
    return res.status(400).json({ message: 'Category not set. Available categories - business,entertainment,general,healthscience,sports,technology' });
  }

  preferences.set(req.userId, updatedPreferences);

  res.status(200).json({ message: 'Preferences updated successfully' });
});

// Fetch news articles based on the logged-in user's preferences
app.get('/news', verifyToken, (req, res) => {

  // If query is not provided, default to empty string - this will fetch all news articles
  // for the logged-in user's preferences
  let query = req.body.query ?? ""

  const userPreferences = preferences.get(req.userId);
  if (!userPreferences) {
      return res.status(400).json({ message: 'Preferences not found' });
  }

  // Fetch news articles using external APIs and filter based on user preferences
  // Implement this logic using async/await and Promises
  asyncFetchHeadlines(query, userPreferences).then((filteredArticles) => {
    res.status(200).json({ articles: filteredArticles })
  }).catch((err) => {
    console.log(err);
    res.status(500).json({ message: 'Failed to fetch news' });
  })
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
