const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
const users = [];
const shortlists = new Map();

// POST /users - Create a new user
app.post('/users', (req, res) => {
  const { name, age, interests } = req.body;
  if (!name || !age || !Array.isArray(interests) || interests.length === 0) {
    return res.status(400).json({ error: 'Name, age, and interests (array) are required' });
  }
  const user = { name, age, interests };
  users.push(user);
  res.status(201).json({ message: 'User created', user });
});

// GET /users - Get all users
app.get('/users', (req, res) => {
  res.json(users);
});

// GET /matches/:username - Get matches with at least two shared interests
app.get('/matches/:username', (req, res) => {
  const username = req.params.username;
  const user = users.find(u => u.name.toLowerCase() === username.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const matches = users
    .filter(u => u.name.toLowerCase() !== username.toLowerCase())
    .map(u => {
      const sharedInterests = u.interests.filter(i => user.interests.includes(i));
      return { ...u, sharedInterests };
    })
    .filter(u => u.sharedInterests.length >= 2);

  res.json(matches);
});

// POST /shortlist - Shortlist a match
app.post('/shortlist', (req, res) => {
  const { username, matchName } = req.body;
  if (!username || !matchName) {
    return res.status(400).json({ error: 'Username and matchName are required' });
  }
  if (!users.find(u => u.name.toLowerCase() === username.toLowerCase())) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (!users.find(u => u.name.toLowerCase() === matchName.toLowerCase())) {
    return res.status(404).json({ error: 'Match not found' });
  }

  const userShortlists = shortlists.get(username.toLowerCase()) || [];
  const matchNameLower = matchName.toLowerCase();
  if (!userShortlists.includes(matchNameLower)) {
    userShortlists.push(matchNameLower);
    shortlists.set(username.toLowerCase(), userShortlists);
  }
  res.json({ message: 'Match shortlisted', shortlists: userShortlists });
});

// GET /shortlist/:username - Get shortlisted matches
app.get('/shortlist/:username', (req, res) => {
  const username = req.params.username.toLowerCase();
  const userShortlists = shortlists.get(username) || [];
  res.json(userShortlists);
});

// DELETE /shortlist/:username/:matchName - Remove a shortlisted match
app.delete('/shortlist/:username/:matchName', (req, res) => {
  const username = req.params.username.toLowerCase();
  const matchName = req.params.matchName.toLowerCase();
  const userShortlists = shortlists.get(username) || [];
  if (!userShortlists.includes(matchName)) {
    return res.status(404).json({ error: `Match '${matchName}' not found in shortlist for user '${username}'` });
  }
  const updatedShortlists = userShortlists.filter(name => name.toLowerCase() !== matchName);
  shortlists.set(username, updatedShortlists);
  res.json({ message: 'Match removed from shortlist', shortlists: updatedShortlists });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});