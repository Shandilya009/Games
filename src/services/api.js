// API service layer for backend integration
// This will connect to your Node.js/Express backend when ready

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token')

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong')
    }

    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// User API
export const userAPI = {
  register: async (userData) => {
    return apiCall('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  login: async (credentials) => {
    return apiCall('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  getProfile: async () => {
    return apiCall('/users/profile')
  },

  updateProfile: async (profileData) => {
    return apiCall('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  },

  changePassword: async (passwordData) => {
    return apiCall('/users/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    })
  },

  updateAvatar: async (avatarData) => {
    return apiCall('/users/avatar', {
      method: 'PUT',
      body: JSON.stringify(avatarData),
    })
  },

  getFriends: async () => {
    return apiCall('/users/friends')
  },

  addFriend: async (friendId) => {
    return apiCall('/users/friends', {
      method: 'POST',
      body: JSON.stringify({ friendId }),
    })
  },

  removeFriend: async (friendId) => {
    return apiCall(`/users/friends/${friendId}`, {
      method: 'DELETE',
    })
  },

  getActivityFeed: async () => {
    return apiCall('/users/activity')
  },

  updatePrivacySettings: async (settings) => {
    return apiCall('/users/privacy', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  },
}

// Games API
export const gamesAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString()
    return apiCall(`/games${queryParams ? `?${queryParams}` : ''}`)
  },

  getById: async (gameId) => {
    return apiCall(`/games/${gameId}`)
  },

  addGame: async (gameData) => {
    return apiCall('/games/add', {
      method: 'POST',
      body: JSON.stringify(gameData),
    })
  },
}

// Scores API
export const scoresAPI = {
  submit: async (scoreData) => {
    return apiCall('/scores/submit', {
      method: 'POST',
      body: JSON.stringify(scoreData),
    })
  },

  getUserScores: async (userId) => {
    return apiCall(`/scores/user/${userId}`)
  },
}

// Leaderboard API
export const leaderboardAPI = {
  getTop: async (limit = 10) => {
    return apiCall(`/leaderboard/top?limit=${limit}`)
  },
}

// Mock data for development (remove when backend is ready)
export const mockData = {
  games: [
    {
      _id: 'tic-tac-toe',
      title: 'Tic Tac Toe',
      description:
        'Classic game of X and O. Play against AI and test your strategy!',
      type: 'strategy',
      difficulty: 'easy',
      playCount: 1250,
      gameComponent: 'TicTacToe',
    },
    {
      _id: 'memory-game',
      title: 'Memory Match',
      description: 'Match pairs of cards and improve your memory skills',
      type: 'puzzle',
      difficulty: 'easy',
      playCount: 3400,
      gameComponent: 'MemoryGame',
    },
    {
      _id: 'number-guesser',
      title: 'Number Guesser',
      description: 'Guess the number between 1 and 100. You have 7 attempts!',
      type: 'puzzle',
      difficulty: 'medium',
      playCount: 2100,
      gameComponent: 'NumberGuesser',
    },
    {
      _id: 'snake-game',
      title: 'Snake Game',
      description:
        'Classic snake game! Eat food and grow longer. Avoid hitting walls or yourself!',
      type: 'action',
      difficulty: 'medium',
      playCount: 2800,
      gameComponent: 'SnakeGame',
    },
    {
      _id: 'word-scramble',
      title: 'Word Scramble',
      description:
        'Unscramble words as fast as you can! Test your vocabulary and speed.',
      type: 'puzzle',
      difficulty: 'medium',
      playCount: 1900,
      gameComponent: 'WordScramble',
    },
    {
      _id: 'reaction-time',
      title: 'Reaction Time Test',
      description:
        'Test your reflexes! Click as fast as you can when you see the green light.',
      type: 'action',
      difficulty: 'easy',
      playCount: 3200,
      gameComponent: 'ReactionTime',
    },
    {
      _id: 'quiz-game',
      title: 'Quiz Game',
      description:
        'Answer 10 questions correctly and earn points! Test your knowledge.',
      type: 'puzzle',
      difficulty: 'medium',
      playCount: 2500,
      gameComponent: 'QuizGame',
    },
    {
      _id: 'rock-paper-scissors',
      title: 'Rock Paper Scissors',
      description:
        'Classic game of chance! Best of 5 rounds against the computer.',
      type: 'strategy',
      difficulty: 'easy',
      playCount: 1800,
      gameComponent: 'RockPaperScissors',
    },
  ],
  leaderboard: [
    { _id: '1', username: 'GameMaster99', totalPoints: 15420 },
    { _id: '2', username: 'ProPlayer', totalPoints: 12850 },
    { _id: '3', username: 'Champion', totalPoints: 11200 },
    { _id: '4', username: 'Winner', totalPoints: 9800 },
    { _id: '5', username: 'EliteGamer', totalPoints: 8750 },
    { _id: '6', username: 'TopPlayer', totalPoints: 7600 },
    { _id: '7', username: 'Gamer123', totalPoints: 6500 },
    { _id: '8', username: 'PlayerOne', totalPoints: 5400 },
    { _id: '9', username: 'GameLover', totalPoints: 4300 },
    { _id: '10', username: 'Newbie', totalPoints: 3200 },
  ],
}
