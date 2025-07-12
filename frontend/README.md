# Companion Matcher

1. Project Overview
     Companion Matcher is a React-based web application that helps users create profiles, find matches based on shared interests, and manage a shortlist of potential companions. The frontend features a modern UI with Tailwind CSS, Heroicons, and animations, while the backend (assumed to be Node.js/Express with MongoDB) handles user data and matching logic. Key features include:

2. Profile Creation: Users submit name, age, and interests.
      Match Finding: Fetches matches based on shared interests using a username.
      Shortlisting: Users can shortlist and remove matches with a visually appealing interface.
      UI Enhancements: Custom modal with animations, gradient cards, avatar placeholders, and interest tags.

Setup Instructions
Prerequisites

    Node.js: v16 or higher
    npm: v8 or higher
    Backend Server: Running at http://localhost:5000 (see backend setup below)
    Git: For cloning and pushing changes

3. Frontend Setup

    Clone the Repository:
    git clone https://github.com/your-username/companion-matcher.git
    cd companion-matcher


    Install Dependencies:
    npm install
    npm install @heroicons/react axios


    Update index.html:Ensure public/index.html includes Google Fonts:
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap" rel="stylesheet">

  
    Run the Frontend:
    npm run dev

    Open http://localhost:5173 in your browser.

5. Backend Setup
    The backend is assumed to be a Node.js/Express server with MongoDB (possibly MongoDB Realm). Follow these steps:
6. Set Up the Server:
     Ensure a server is running at http://localhost:5000 with the required endpoints (see API Routes below).
     If using MongoDB Realm, configure the schema for users and shortlists.

    Start the Server:
    cd path/to/backend
    npm install
    npm start

    Adjust based on your backend setup (e.g., node server.js).

6. API Route Summary
      The app interacts with the following backend endpoints (assumed at http://localhost:5000):

      POST /users

Description: Creates a user profile.
Input:{
  "name": "John Doe",
  "age": 25,
  "interests": ["reading", "hiking"]
}

Output:{ "message": "User created" }

Error:{ "error": "User already exists" }

GET /matches/:username

Description: Fetches matches for a user based on shared interests.
Input: URL parameter :username (e.g., john_doe).
Output:[
  { "name": "Jane Smith", "age": 23, "sharedInterests": ["reading"] },
  { "name": "Alice Brown", "age": 27, "sharedInterests": ["hiking"] }
]


Error:{ "error": "User not found" }

GET /shortlist/:username

Description: Retrieves shortlisted matches for a user.
Input: URL parameter :username.
Output:["Jane Smith", "Alice Brown"]

Error:{ "error": "User not found" }

POST /shortlist

Description: Adds a match to the user’s shortlist.
Input:{ "username": "john_doe", "matchName": "Jane Smith" }

Output:{ "message": "Match shortlisted" }

Error:{ "error": "Match already shortlisted" }

DELETE /shortlist/:username/:matchName

Description: Removes a match from the user’s shortlist.
Input: URL parameters :username and :matchName.
Output:{ "message": "Match removed from shortlist" }

Error:{ "error": "Match not found in shortlist" }

GET /users/:name

Description: Fetches user details for shortlist display.
Input: URL parameter :name.
Output:{ "name": "Jane Smith", "age": 23, "interests": ["reading", "travel"] }

Error:{ "error": "User not found" }
    Notes

    If the backend isn’t set up, shortlist cards will display placeholders (age: 'Unknown', interests: ['Not available']).
    Ensure the backend server is running before starting the frontend.
    For issues, check the backend logs or update the API endpoints in src/App.jsx.
