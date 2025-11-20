import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { gamesAPI, mockData } from '../services/api';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [_games, setGames] = useState([]);
  const [stats, setStats] = useState({
    totalGames: 0,
    activePlayers: 0,
    totalGamesPlayed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGamesAndStats();
  }, []);

  const loadGamesAndStats = async () => {
    try {
      let gamesData;
      try {
        const response = await gamesAPI.getAll();
        gamesData = response.games || response;
      } catch {
        console.log('Using mock games data (backend not connected)');
        gamesData = mockData.games;
      }

      setGames(gamesData);

      // Calculate stats
      const totalGames = gamesData.length;
      const totalGamesPlayed = gamesData.reduce((sum, game) => sum + (game.playCount || 0), 0);
      const activePlayers = mockData.leaderboard.length || 10;

      // Animate stats counting up
      animateStats({
        totalGames,
        activePlayers,
        totalGamesPlayed,
      });
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const animateStats = (targetStats) => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3); // Ease out cubic

      setStats({
        totalGames: Math.floor(targetStats.totalGames * easeOut),
        activePlayers: Math.floor(targetStats.activePlayers * easeOut),
        totalGamesPlayed: Math.floor(targetStats.totalGamesPlayed * easeOut),
      });

      if (currentStep >= steps) {
        setStats(targetStats);
        clearInterval(interval);
      }
    }, stepDuration);
  };

  const handleFeatureClick = (feature) => {
    switch (feature) {
      case 'leaderboard':
        if (user) {
          navigate('/leaderboard');
        } else {
          navigate('/login');
        }
        break;
      case 'games':
        navigate('/games');
        break;
      case 'community':
        if (user) {
          navigate('/profile');
        } else {
          navigate('/register');
        }
        break;
      case 'progress':
        if (user) {
          navigate('/profile');
        } else {
          navigate('/register');
        }
        break;
      default:
        break;
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M+';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K+';
    }
    return num.toString();
  };

  return (
    <div className="min-h-[calc(100vh-80px)] overflow-x-hidden">
      {/* Hero Section */}
      <section className="min-h-[90vh] grid grid-cols-1 lg:grid-cols-2 gap-16 px-12 py-16 max-w-7xl mx-auto items-center relative">
        <div className="relative z-10 animate-[fadeInUp_0.8s_ease-out]">
          <h1 className="text-6xl lg:text-7xl font-black mb-6 leading-tight bg-gradient-to-r from-[#00d4ff] via-[#7b2cbf] to-[#ff006e] bg-clip-text text-transparent uppercase tracking-tight">
            Welcome to GameHub
          </h1>
          <p className="text-xl mb-12 text-[#a0aec0] leading-relaxed font-light">
            Your ultimate destination for competitive gaming and community fun. Join thousands of players competing for the top spot on our live leaderboards.
          </p>
          <div className="flex gap-6 flex-wrap">
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="px-12 py-5 rounded-xl text-white font-bold text-base uppercase tracking-wide transition-all relative overflow-hidden bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] shadow-[0_8px_25px_rgba(0,212,255,0.3)] hover:-translate-y-1 hover:scale-105 hover:shadow-[0_15px_35px_rgba(0,212,255,0.5)] z-10"
                >
                  Get Started
                </Link>
                <Link
                  to="/games"
                  className="px-12 py-5 rounded-xl text-[#00d4ff] font-bold text-base uppercase tracking-wide transition-all relative overflow-hidden bg-transparent border-2 border-[#00d4ff] hover:bg-[rgba(0,212,255,0.1)] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,212,255,0.3)] z-10"
                >
                  Browse Games
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/games"
                  className="px-12 py-5 rounded-xl text-white font-bold text-base uppercase tracking-wide transition-all relative overflow-hidden bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] shadow-[0_8px_25px_rgba(0,212,255,0.3)] hover:-translate-y-1 hover:scale-105 hover:shadow-[0_15px_35px_rgba(0,212,255,0.5)] z-10"
                >
                  Play Games
                </Link>
                <Link
                  to="/leaderboard"
                  className="px-12 py-5 rounded-xl text-[#00d4ff] font-bold text-base uppercase tracking-wide transition-all relative overflow-hidden bg-transparent border-2 border-[#00d4ff] hover:bg-[rgba(0,212,255,0.1)] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,212,255,0.3)] z-10"
                >
                  View Leaderboard
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="relative z-10 hidden lg:block animate-[slideInRight_0.8s_ease-out]">
          <div className="bg-[#1a2332] border border-[#2d3748] rounded-3xl p-12 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="text-center text-[#a0aec0]">
              <div className="text-7xl mb-4">🎮</div>
              <h3 className="text-white mb-4 text-2xl font-bold">Ready to Play?</h3>
              <p>Join the competition and climb the ranks!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-12 max-w-7xl mx-auto">
        <h2 className="text-5xl font-black mb-16 text-center bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] bg-clip-text text-transparent uppercase tracking-tight relative inline-block w-full">
          Why Choose GameHub?
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] rounded"></span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <button
            onClick={() => handleFeatureClick('leaderboard')}
            className="bg-[#1a2332] border border-[#2d3748] rounded-2xl p-10 text-center transition-all relative overflow-hidden flex flex-col gap-6 hover:-translate-y-2.5 hover:border-[#00d4ff] hover:shadow-[0_20px_40px_rgba(0,212,255,0.2)] hover:bg-[#252f42] cursor-pointer group"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] scale-x-0 transition-transform duration-400 group-hover:scale-x-100"></div>
            <div className="text-6xl drop-shadow-[0_0_20px_#00d4ff] transition-transform duration-400 group-hover:scale-125 group-hover:rotate-12">🏆</div>
            <h3 className="text-2xl text-white font-extrabold uppercase tracking-wide">Live Leaderboards</h3>
            <p className="text-[#a0aec0] leading-relaxed flex-1">Compete with players worldwide and see real-time rankings</p>
            <div className="mt-2 text-[#00d4ff] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              {user ? 'View Leaderboard →' : 'Login to View →'}
            </div>
          </button>
          <button
            onClick={() => handleFeatureClick('games')}
            className="bg-[#1a2332] border border-[#2d3748] rounded-2xl p-10 text-center transition-all relative overflow-hidden flex flex-col gap-6 hover:-translate-y-2.5 hover:border-[#00d4ff] hover:shadow-[0_20px_40px_rgba(0,212,255,0.2)] hover:bg-[#252f42] cursor-pointer group"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] scale-x-0 transition-transform duration-400 group-hover:scale-x-100"></div>
            <div className="text-6xl drop-shadow-[0_0_20px_#00d4ff] transition-transform duration-400 group-hover:scale-125 group-hover:rotate-12">🎮</div>
            <h3 className="text-2xl text-white font-extrabold uppercase tracking-wide">Diverse Games</h3>
            <p className="text-[#a0aec0] leading-relaxed flex-1">Access a wide variety of games from puzzle to action</p>
            <div className="mt-2 text-[#00d4ff] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              Explore Games →
            </div>
          </button>
          <button
            onClick={() => handleFeatureClick('community')}
            className="bg-[#1a2332] border border-[#2d3748] rounded-2xl p-10 text-center transition-all relative overflow-hidden flex flex-col gap-6 hover:-translate-y-2.5 hover:border-[#00d4ff] hover:shadow-[0_20px_40px_rgba(0,212,255,0.2)] hover:bg-[#252f42] cursor-pointer group"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] scale-x-0 transition-transform duration-400 group-hover:scale-x-100"></div>
            <div className="text-6xl drop-shadow-[0_0_20px_#00d4ff] transition-transform duration-400 group-hover:scale-125 group-hover:rotate-12">👥</div>
            <h3 className="text-2xl text-white font-extrabold uppercase tracking-wide">Community Driven</h3>
            <p className="text-[#a0aec0] leading-relaxed flex-1">Join a vibrant community of gamers and compete together</p>
            <div className="mt-2 text-[#00d4ff] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              {user ? 'View Profile →' : 'Join Now →'}
            </div>
          </button>
          <button
            onClick={() => handleFeatureClick('progress')}
            className="bg-[#1a2332] border border-[#2d3748] rounded-2xl p-10 text-center transition-all relative overflow-hidden flex flex-col gap-6 hover:-translate-y-2.5 hover:border-[#00d4ff] hover:shadow-[0_20px_40px_rgba(0,212,255,0.2)] hover:bg-[#252f42] cursor-pointer group"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] scale-x-0 transition-transform duration-400 group-hover:scale-x-100"></div>
            <div className="text-6xl drop-shadow-[0_0_20px_#00d4ff] transition-transform duration-400 group-hover:scale-125 group-hover:rotate-12">📊</div>
            <h3 className="text-2xl text-white font-extrabold uppercase tracking-wide">Track Progress</h3>
            <p className="text-[#a0aec0] leading-relaxed flex-1">Monitor your scores and improve your gaming skills</p>
            <div className="mt-2 text-[#00d4ff] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              {user ? 'View Stats →' : 'Get Started →'}
            </div>
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-12 max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <button
            onClick={() => navigate('/games')}
            className="bg-[#1a2332] border border-[#2d3748] rounded-2xl p-12 text-center transition-all relative overflow-hidden hover:-translate-y-2.5 hover:scale-105 hover:border-[#00d4ff] hover:shadow-[0_20px_40px_rgba(0,212,255,0.3)] cursor-pointer group"
          >
            <div className="text-6xl font-black mb-4 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] bg-clip-text text-transparent leading-none">
              {loading ? '...' : `${stats.totalGames}+`}
            </div>
            <div className="text-xl text-[#a0aec0] font-semibold uppercase tracking-wide relative z-10 group-hover:text-[#00d4ff] transition-colors">
              Games Available
            </div>
            <div className="mt-2 text-[#00d4ff] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              View All Games →
            </div>
          </button>
          <button
            onClick={() => user ? navigate('/leaderboard') : navigate('/login')}
            className="bg-[#1a2332] border border-[#2d3748] rounded-2xl p-12 text-center transition-all relative overflow-hidden hover:-translate-y-2.5 hover:scale-105 hover:border-[#00d4ff] hover:shadow-[0_20px_40px_rgba(0,212,255,0.3)] cursor-pointer group"
          >
            <div className="text-6xl font-black mb-4 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] bg-clip-text text-transparent leading-none">
              {loading ? '...' : formatNumber(stats.activePlayers)}
            </div>
            <div className="text-xl text-[#a0aec0] font-semibold uppercase tracking-wide relative z-10 group-hover:text-[#00d4ff] transition-colors">
              Active Players
            </div>
            <div className="mt-2 text-[#00d4ff] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              {user ? 'View Leaderboard →' : 'Join Now →'}
            </div>
          </button>
          <button
            onClick={() => navigate('/games')}
            className="bg-[#1a2332] border border-[#2d3748] rounded-2xl p-12 text-center transition-all relative overflow-hidden hover:-translate-y-2.5 hover:scale-105 hover:border-[#00d4ff] hover:shadow-[0_20px_40px_rgba(0,212,255,0.3)] cursor-pointer group"
          >
            <div className="text-6xl font-black mb-4 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] bg-clip-text text-transparent leading-none">
              {loading ? '...' : formatNumber(stats.totalGamesPlayed)}
            </div>
            <div className="text-xl text-[#a0aec0] font-semibold uppercase tracking-wide relative z-10 group-hover:text-[#00d4ff] transition-colors">
              Games Played
            </div>
            <div className="mt-2 text-[#00d4ff] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              Start Playing →
            </div>
          </button>
        </div>
      </section>

      {/* Call to Action Section */}
      {!user && (
        <section className="py-24 px-12 max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-[rgba(0,212,255,0.1)] to-[rgba(123,44,191,0.1)] border-2 border-[rgba(0,212,255,0.3)] rounded-3xl p-16 text-center shadow-[0_20px_60px_rgba(0,212,255,0.2)]">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] bg-clip-text text-transparent uppercase tracking-tight">
              Ready to Start Playing?
            </h2>
            <p className="text-xl text-[#a0aec0] mb-10 max-w-2xl mx-auto">
              Join thousands of players competing for the top spot. Create your account and start earning points today!
            </p>
            <div className="flex gap-6 justify-center flex-wrap">
              <Link
                to="/register"
                className="px-12 py-5 rounded-xl text-white font-bold text-base uppercase tracking-wide transition-all relative overflow-hidden bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] shadow-[0_8px_25px_rgba(0,212,255,0.3)] hover:-translate-y-1 hover:scale-105 hover:shadow-[0_15px_35px_rgba(0,212,255,0.5)] z-10"
              >
                Sign Up Free
              </Link>
              <Link
                to="/games"
                className="px-12 py-5 rounded-xl text-[#00d4ff] font-bold text-base uppercase tracking-wide transition-all relative overflow-hidden bg-transparent border-2 border-[#00d4ff] hover:bg-[rgba(0,212,255,0.1)] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,212,255,0.3)] z-10"
              >
                Browse Games
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
