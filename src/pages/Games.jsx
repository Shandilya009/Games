import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { gamesAPI, mockData } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

function Games() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();
  const [filters, setFilters] = useState({
    type: '',
    difficulty: '',
  });

  useEffect(() => {
    loadGames();
  }, [filters]);

  const loadGames = async () => {
    setLoading(true);
    try {
      let data;
      try {
        const response = await gamesAPI.getAll(filters);
        data = response.games || response;
      } catch {
        console.log('Using mock games data (backend not connected)');
        data = mockData.games;
      }

      let filteredGames = data;
      if (filters.type) {
        filteredGames = filteredGames.filter(game => game.type === filters.type);
      }
      if (filters.difficulty) {
        filteredGames = filteredGames.filter(game => game.difficulty === filters.difficulty);
      }

      setGames(filteredGames);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  

  const clearFilters = () => {
    setFilters({ type: '', difficulty: '' });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] px-12 py-16 max-w-7xl mx-auto">
      <div className="text-center mb-16 animate-[fadeInUp_0.6s_ease-out]">
        <h1 className="text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] bg-clip-text text-transparent uppercase tracking-tight">
          Game Directory
        </h1>
        <p className="text-xl text-[#a0aec0] font-light">
          Discover and play amazing games. Compete with players worldwide!
        </p>
      </div>

      <div className="flex gap-6 mb-16 flex-wrap items-end p-8 bg-gradient-to-r from-[rgba(0,212,255,0.05)] to-[rgba(123,44,191,0.05)] rounded-3xl shadow-[0_8px_25px_rgba(0,0,0,0.08)] border border-[rgba(0,212,255,0.1)] backdrop-blur-sm">
        <div className="flex flex-col gap-3 flex-1 min-w-[200px]">
          <label htmlFor="type-filter" className="font-bold text-white text-sm uppercase tracking-wide">Game Type:</label>
          <select
            id="type-filter"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="p-4 border-2 border-[#2d3748] rounded-xl text-base bg-[#141b2d] text-white cursor-pointer transition-all font-medium shadow-[0_2px_8px_rgba(0,0,0,0.05)] focus:outline-none focus:border-[#00d4ff] focus:shadow-[0_0_0_4px_rgba(0,212,255,0.1)] focus:-translate-y-0.5"
          >
            <option value="">All Types</option>
            <option value="puzzle">Puzzle</option>
            <option value="action">Action</option>
            <option value="strategy">Strategy</option>
          </select>
        </div>

        <div className="flex flex-col gap-3 flex-1 min-w-[200px]">
          <label htmlFor="difficulty-filter" className="font-bold text-white text-sm uppercase tracking-wide">Difficulty:</label>
          <select
            id="difficulty-filter"
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="p-4 border-2 border-[#2d3748] rounded-xl text-base bg-[#141b2d] text-white cursor-pointer transition-all font-medium shadow-[0_2px_8px_rgba(0,0,0,0.05)] focus:outline-none focus:border-[#00d4ff] focus:shadow-[0_0_0_4px_rgba(0,212,255,0.1)] focus:-translate-y-0.5"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {(filters.type || filters.difficulty) && (
          <button
            onClick={clearFilters}
            className="px-8 py-4 bg-gradient-to-r from-[#dc3545] to-[#c82333] text-white border-none rounded-xl cursor-pointer font-bold transition-all shadow-[0_4px_15px_rgba(220,53,69,0.3)] uppercase tracking-wide text-sm hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(220,53,69,0.4)]"
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading games..." size="large" />
      ) : games.length === 0 ? (
        <div className="text-center py-20 px-8 text-[#a0aec0]">
          <div className="text-8xl mb-6 opacity-50">🎮</div>
          <h3 className="text-3xl text-white mb-4 font-bold">No games found</h3>
          <p className="text-lg mb-8">No games match your current filters. Try adjusting your search criteria.</p>
          {(filters.type || filters.difficulty) && (
            <button
              onClick={clearFilters}
              className="px-8 py-3 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] text-white border-none rounded-xl cursor-pointer font-bold transition-all shadow-[0_4px_15px_rgba(0,212,255,0.3)] uppercase tracking-wide text-sm hover:-translate-y-1 hover:shadow-[0_6px_25px_rgba(0,212,255,0.5)]"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {games.map((game) => (
            <div
              key={game._id}
              className="bg-[#1a2332] rounded-3xl p-10 transition-all flex flex-col relative overflow-hidden border border-[rgba(0,212,255,0.1)] hover:-translate-y-2.5 hover:scale-[1.02] hover:border-[rgba(0,212,255,0.3)] hover:shadow-[0_20px_40px_rgba(0,212,255,0.2)]"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] scale-x-0 transition-transform duration-400 hover:scale-x-100"></div>
              <div className="flex justify-between items-start mb-6 gap-4">
                <h3 className="text-2xl text-white m-0 flex-1 font-extrabold leading-tight uppercase tracking-wide">{game.title}</h3>
                <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap shadow-[0_2px_8px_rgba(0,0,0,0.1)] ${
                  game.difficulty === 'easy'
                    ? 'bg-gradient-to-r from-[rgba(0,212,255,0.2)] to-[rgba(0,212,255,0.1)] text-[#00d4ff] border border-[rgba(0,212,255,0.3)]'
                    : game.difficulty === 'medium'
                    ? 'bg-gradient-to-r from-[rgba(123,44,191,0.2)] to-[rgba(123,44,191,0.1)] text-[#7b2cbf] border border-[rgba(123,44,191,0.3)]'
                    : 'bg-gradient-to-r from-[rgba(255,0,110,0.2)] to-[rgba(255,0,110,0.1)] text-[#ff006e] border border-[rgba(255,0,110,0.3)]'
                }`}>
                  {game.difficulty}
                </span>
              </div>
              <p className="text-[#a0aec0] leading-relaxed mb-8 flex-1 text-base">{game.description}</p>
              <div className="flex justify-between items-center mb-8 pt-6 border-t-2 border-[#f0f0f0]">
                <span className="uppercase text-[#00d4ff] font-bold px-4 py-2 bg-gradient-to-r from-[rgba(0,212,255,0.1)] to-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.2)] rounded-full text-sm tracking-wide">
                  {game.type}
                </span>
                <span className="text-[#a0aec0] text-sm font-semibold flex items-center gap-2">
                  👥 {game.playCount.toLocaleString()} plays
                </span>
              </div>
              {game.gameComponent ? (
                <Link
                  to={`/play/${game._id}`}
                  className="bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] text-white py-4 px-8 rounded-xl text-center font-bold transition-all block relative overflow-hidden shadow-[0_4px_15px_rgba(0,212,255,0.3)] uppercase tracking-wide hover:-translate-y-1 hover:scale-105 hover:shadow-[0_8px_25px_rgba(0,212,255,0.5)]"
                  onClick={(e) => {
                    if (!user) {
                      e.preventDefault();
                      showToast('Please login to play games', 'warning');
                    }
                  }}
                >
                  Play Now →
                </Link>
              ) : (
                <div className="bg-[#141b2d] text-[#718096] py-4 px-8 rounded-xl text-center font-bold cursor-not-allowed opacity-60">
                  Coming Soon
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Games;
