# News-Aggregator
Objective: Build a RESTful API that allows users to fetch news articles from multiple sources based on their preferences.


Project Description: In this project, we will create a RESTful API using Node.js, Express.js, and NPM packages. The API will allow users to register, log in, and set their news preferences (e.g., categories, sources). The API will then fetch news articles from multiple sources using external news APIs (e.g., NewsAPI). The fetched articles should be processed and filtered asynchronously based on user preferences.

Submission guidelines
Requirements:

Set up a basic Node.js project with Express.js and other necessary NPM packages.

Implement user registration and login using bcrypt and JWT for password hashing and token-based authentication.

Create an in-memory data store (e.g., an array) to store user information and their news preferences.

Implement a RESTful API with the following endpoints:

POST /register: Register a new user.

POST /login: Log in a user.

GET /preferences: Retrieve the news preferences for the logged-in user.

PUT /preferences: Update the news preferences for the logged-in user.

GET /news: Fetch news articles based on the logged-in user's preferences.

Use external news APIs to fetch news articles from multiple sources. Incorporate async/await and Promises in the process of fetching news data and filtering it based on user preferences.

Implement proper error handling for invalid requests, authentication errors, and authorization errors.

Add input validation for user registration and news preference updates.

Test the API using Postman or Curl to ensure it works as expected.

# Test APIs
1. localhost:3000/register 
    {
    "username": "Ankita",
    "password": "testtest"
}
2. 