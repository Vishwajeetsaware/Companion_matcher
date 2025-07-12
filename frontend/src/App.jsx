import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const Modal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
      <div
        className="bg-white rounded-2xl p-8 max-w-md w-full transform transition-all duration-300 scale-100 animate-scaleIn animate-pulseOnce shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="bg-gradient-to-r from-indigo-300 to-teal-300 rounded-t-2xl -mx-8 -mt-8 p-4 mb-6">
          <h3 id="modal-title" className="text-2xl font-bold text-indigo-900 text-center flex items-center justify-center gap-2">
            <CheckCircleIcon className="w-6 h-6" />
            {message.includes('failed') ? 'Error' : 'Success'}
          </h3>
        </div>
        <p className="text-lg text-gray-700 mb-6 text-center">{message}</p>
        <button
          onClick={onClose}
          className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white px-6 py-3 rounded-lg w-full hover:from-indigo-700 hover:to-indigo-900 hover:scale-105 transition duration-300 flex items-center justify-center gap-2"
          aria-label="Close modal"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const App = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [interests, setInterests] = useState('');
  const [username, setUsername] = useState('');
  const [matches, setMatches] = useState([]);
  const [shortlists, setShortlists] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const interestsArray = interests.split(',').map(i => i.trim());
      await axios.post('http://localhost:5000/users', { name, age: parseInt(age), interests: interestsArray });
      setModalMessage('Profile created successfully!');
      setIsModalOpen(true);
      setName('');
      setAge('');
      setInterests('');
    } catch (err) {
      setModalMessage(err.response?.data?.error || 'Error creating profile');
      setIsModalOpen(true);
    }
  };

  const fetchMatches = async () => {
    if (!username) return;
    try {
      const response = await axios.get(`http://localhost:5000/matches/${username}`);
      setMatches(response.data);
    } catch (err) {
      setModalMessage(err.response?.data?.error || 'Error fetching matches');
      setIsModalOpen(true);
    }
  };

  const fetchShortlists = async () => {
    if (!username) return;
    try {
      const response = await axios.get(`http://localhost:5000/shortlist/${username.toLowerCase()}`);
      const shortlistData = await Promise.all(
        response.data.map(async (name) => {
          try {
            const userResponse = await axios.get(`http://localhost:5000/users/${name}`);
            return userResponse.data;
          } catch {
            return { name, age: 'Unknown', interests: ['Not available'] };
          }
        })
      );
      setShortlists(shortlistData);
    } catch (err) {
      setModalMessage(err.response?.data?.error || 'Error fetching shortlists');
      setIsModalOpen(true);
    }
  };

  const handleShortlist = async (matchName) => {
    try {
      await axios.post('http://localhost:5000/shortlist', { username: username.toLowerCase(), matchName });
      fetchShortlists();
    } catch (err) {
      setModalMessage(err.response?.data?.error || 'Error shortlisting match');
      setIsModalOpen(true);
    }
  };

  const handleRemoveShortlist = async (matchName) => {
    if (!username) {
      setModalMessage('Please enter a username before removing a shortlist.');
      setIsModalOpen(true);
      return;
    }
    try {
      const previousShortlists = [...shortlists];
      setShortlists(shortlists.filter(user => user.name.toLowerCase() !== matchName.toLowerCase()));
      
      console.log(`Attempting to remove ${matchName} from shortlist for user ${username.toLowerCase()}`);
      await axios.delete(`http://localhost:5000/shortlist/${username.toLowerCase()}/${matchName.toLowerCase()}`);
      setModalMessage(`${matchName} removed from shortlist!`);
      setIsModalOpen(true);
    } catch (err) {
      setShortlists(previousShortlists);
      console.error('Error removing shortlist:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: `http://localhost:5000/shortlist/${username.toLowerCase()}/${matchName.toLowerCase()}`
      });
      setModalMessage(err.response?.data?.error || `Failed to remove ${matchName} from shortlist. Please check if the match exists.`);
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    fetchShortlists();
  }, [username]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-teal-100 to-amber-100 p-6 sm:p-10">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-5xl font-extrabold text-indigo-900 mb-12 text-center tracking-tight drop-shadow-lg">
          Companion Matcher
        </h1>

        <div className="bg-white shadow-2xl rounded-2xl p-8 mb-10 transition-all hover:shadow-3xl">
          <h2 className="text-3xl font-bold text-indigo-800 mb-6">Create Your Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-200 p-4 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-gray-50 text-gray-800 placeholder-gray-400"
              required
            />
            <input
              type="number"
              placeholder="Your Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="border border-gray-200 p-4 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-gray-50 text-gray-800 placeholder-gray-400"
              required
            />
            <input
              type="text"
              placeholder="Interests (comma-separated)"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="border border-gray-200 p-4 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-gray-50 text-gray-800 placeholder-gray-400"
              required
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-4 rounded-xl w-full hover:from-indigo-700 hover:to-indigo-900 hover:scale-105 transition duration-300 flex items-center justify-center gap-2 shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Create Profile
            </button>
          </form>
        </div>

        <div className="bg-white shadow-2xl rounded-2xl p-8 mb-10">
          <h2 className="text-3xl font-bold text-indigo-800 mb-6">Find Matches</h2>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border border-gray-200 p-4 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition bg-gray-50 text-gray-800 placeholder-gray-400 mb-4"
          />
          <button
            onClick={fetchMatches}
            className="bg-gradient-to-r from-teal-600 to-teal-800 text-white p-4 rounded-xl w-full hover:from-teal-700 hover:to-teal-900 hover:scale-105 transition duration-300 flex items-center justify-center gap-2 shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Get Matches
          </button>
        </div>

        <div className="bg-white shadow-2xl rounded-2xl p-8 mb-10">
          <h2 className="text-3xl font-bold text-indigo-800 mb-6">Your Matches</h2>
          {matches.length === 0 ? (
            <p className="text-gray-600 text-center">No matches found</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map((match) => (
                <div
                  key={match.name}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-transparent rounded-xl p-6 hover:shadow-xl hover:scale-102 transition-all duration-300 hover:border-gradient"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-200 to-teal-200 flex items-center justify-center text-indigo-800 font-bold">
                      {match.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-xl text-indigo-900">
                        {match.name}
                        <span className="text-gray-500 text-sm ml-2">(Age: {match.age})</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mb-3">
                    <span className="font-medium">Shared Interests:</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {match.sharedInterests.map((interest, index) => (
                      <span
                        key={index}
                        className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleShortlist(match.name)}
                    className="mt-4 bg-gradient-to-r from-amber-600 to-amber-800 text-white p-3 rounded-lg w-full hover:from-amber-700 hover:to-amber-900 hover:scale-105 transition duration-300 flex items-center justify-center gap-2 shadow-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Shortlist
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8">
          <h2 className="text-3xl font-bold text-indigo-800 mb-6">Shortlisted Matches</h2>
          {shortlists.length === 0 ? (
            <p className="text-gray-600 text-center">No shortlisted matches</p>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {shortlists.map((user) => (
                <div
                  key={user.name}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-transparent rounded-lg p-4 sm:p-6 hover:shadow-xl hover:scale-102 transition-all duration-300 hover:border-gradient relative"
                >
                  <button
                    onClick={() => handleRemoveShortlist(user.name)}
                    className="absolute top-1 right-1 sm:top-2 sm:right-2 text-gray-500 hover:text-red-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 rounded-full"
                    aria-label={`Remove ${user.name} from shortlist`}
                  >
                    <XCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <div className="flex justify-center items-center h-full">
                    <p className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-600 tracking-wide">
                      {user.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          message={modalMessage}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default App;