import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { leaderboardAPI, mockData } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

function Leaderboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const intervalRef = useRef(null);
  const eventListenerRef = useRef(null);

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Simulate real-time updates for mock data
  const updateMockLeaderboard = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const updatedLeaderboard = [...mockData.leaderboard];

      // Find if user exists in leaderboard
      const userIndex = updatedLeaderboard.findIndex(p => p.username === user.username);

      if (userIndex !== -1) {
        // Update existing user
        updatedLeaderboard[userIndex].totalPoints = user.totalPoints || 0;
      } else {
        // Add new user if they have points
        if (user.totalPoints > 0) {
          updatedLeaderboard.push({
            _id: user._id || Date.now().toString(),
            username: user.username,
            totalPoints: user.totalPoints || 0,
          });
        }
      }

      // Sort by totalPoints descending
      updatedLeaderboard.sort((a, b) => b.totalPoints - a.totalPoints);

      // Keep top 10
      return updatedLeaderboard.slice(0, 10);
    }

    return mockData.leaderboard;
  };

  const loadLeaderboard = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setIsUpdating(true);
    }

    try {
      let data;
      try {
        const response = await leaderboardAPI.getTop(10);
        data = response.users || response;
      } catch {
        console.log('Using mock leaderboard data (backend not connected)');
        // Simulate real-time updates for mock data
        data = updateMockLeaderboard();
      }

      setLeaderboard(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
      setIsUpdating(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboard();

    // Set up real-time polling every 3 seconds
    intervalRef.current = setInterval(() => {
      loadLeaderboard(true);
    }, 3000);

    // Listen for user update events (when scores are submitted)
    eventListenerRef.current = () => {
      loadLeaderboard(true);
    };
    window.addEventListener('userUpdated', eventListenerRef.current);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (eventListenerRef.current) {
        window.removeEventListener('userUpdated', eventListenerRef.current);
      }
    };
  }, [loadLeaderboard]);

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  // Don't render if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] px-12 py-16 max-w-5xl mx-auto">
      <div className="text-center mb-16 animate-[fadeInUp_0.6s_ease-out]">
        <h1 className="text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] bg-clip-text text-transparent uppercase tracking-tight">
          🏆 Live Leaderboard
        </h1>
        <p className="text-xl text-[#a0aec0] font-light mb-2">
          Top players competing for the crown. Rankings update in real-time!
        </p>
        <div className="flex items-center justify-center gap-3 text-sm text-[#a0aec0]">
          {isUpdating && (
            <span className="flex items-center gap-2 text-[#00d4ff]">
              <span className="animate-spin">🔄</span>
              Updating...
            </span>
          )}
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#00ff00] rounded-full animate-pulse"></span>
            Live
          </span>
          <span>•</span>
          <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading leaderboard..." size="large" />
      ) : (
        <div className="bg-[#1a2332] border border-[#2d3748] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden animate-[fadeInUp_0.6s_ease-out_0.2s_both]">
          <div className="grid grid-cols-[100px_1fr_220px] p-8 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] text-white font-extrabold text-xl uppercase tracking-wider shadow-[0_4px_15px_rgba(0,212,255,0.3)]">
            <div>Rank</div>
            <div>Player</div>
            <div className="text-right">Total Points</div>
          </div>

          {leaderboard.map((player, index) => {
            const rank = index + 1;
            const isTopThree = rank <= 3;
            return (
              <div
                key={player._id}
                className={`grid grid-cols-[100px_1fr_220px] p-7 border-b border-[#2d3748] transition-all items-center relative ${
                  isTopThree
                    ? rank === 1
                      ? 'bg-gradient-to-r from-[rgba(255,215,0,0.15)] to-transparent border-l-4 border-[#ffd700]'
                      : rank === 2
                      ? 'bg-gradient-to-r from-[rgba(192,192,192,0.15)] to-transparent border-l-4 border-[#c0c0c0]'
                      : 'bg-gradient-to-r from-[rgba(205,127,50,0.15)] to-transparent border-l-4 border-[#cd7f32]'
                    : 'bg-[#1a2332] hover:bg-[#252f42]'
                } hover:translate-x-1`}
              >
                <div className="flex items-center justify-center">
                  <span className="text-3xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                    {getRankIcon(rank)}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center gap-6">
                    <div className="w-15 h-15 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] text-white flex items-center justify-center font-black text-2xl shadow-[0_4px_15px_rgba(0,212,255,0.3)] transition-all border-4 border-[#1a2332] hover:scale-110 hover:rotate-6 hover:shadow-[0_6px_20px_rgba(0,212,255,0.5)]">
                      {player.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-xl text-white">{player.username}</span>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <span className="text-2xl font-black bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] bg-clip-text text-transparent">
                    {player.totalPoints.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}

          {leaderboard.length === 0 && (
            <div className="text-center py-20 px-8 text-[#a0aec0] font-medium text-xl">
              No players on the leaderboard yet.
            </div>
          )}
        </div>
      )}

      <div className="mt-12 text-center p-8 bg-gradient-to-r from-[rgba(0,212,255,0.05)] to-[rgba(123,44,191,0.05)] rounded-2xl border border-[rgba(0,212,255,0.1)] shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <p className="text-[#a0aec0] text-lg m-0 font-medium">
          💡 Tip: Play games and earn points to climb the leaderboard!
        </p>
      </div>
    </div>
  );
}

export default Leaderboard;
