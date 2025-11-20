import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 bg-[rgba(20,27,45,0.8)] backdrop-blur-xl border-b border-[#2d3748] shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 text-3xl font-extrabold text-white uppercase tracking-wider transition-all hover:scale-105 hover:text-[#00d4ff] hover:drop-shadow-[0_0_20px_#00d4ff]">
          <span className="text-4xl drop-shadow-[0_0_10px_#00d4ff] animate-pulse">🎮</span>
          GameHub
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className={`px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all relative ${
              isActive('/')
                ? 'text-[#00d4ff] bg-[rgba(0,212,255,0.15)] before:w-full'
                : 'text-[#a0aec0] hover:text-white hover:bg-[rgba(0,212,255,0.1)]'
            } before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:h-0.5 before:bg-[#00d4ff] before:transition-all before:w-0 hover:before:w-4/5`}
          >
            Home
          </Link>
          <Link
            to="/games"
            className={`px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all relative ${
              isActive('/games')
                ? 'text-[#00d4ff] bg-[rgba(0,212,255,0.15)] before:w-full'
                : 'text-[#a0aec0] hover:text-white hover:bg-[rgba(0,212,255,0.1)]'
            } before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:h-0.5 before:bg-[#00d4ff] before:transition-all before:w-0 hover:before:w-4/5`}
          >
            Games
          </Link>
          {user && (
            <Link
              to="/leaderboard"
              className={`px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all relative ${
                isActive('/leaderboard')
                  ? 'text-[#00d4ff] bg-[rgba(0,212,255,0.15)] before:w-full'
                  : 'text-[#a0aec0] hover:text-white hover:bg-[rgba(0,212,255,0.1)]'
              } before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:h-0.5 before:bg-[#00d4ff] before:transition-all before:w-0 hover:before:w-4/5`}
            >
              Leaderboard
            </Link>
          )}

          {user ? (
            <>
              <Link
                to="/profile"
                className={`px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all relative ${
                  isActive('/profile')
                    ? 'text-[#00d4ff] bg-[rgba(0,212,255,0.15)] before:w-full'
                    : 'text-[#a0aec0] hover:text-white hover:bg-[rgba(0,212,255,0.1)]'
                } before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:h-0.5 before:bg-[#00d4ff] before:transition-all before:w-0 hover:before:w-4/5`}
              >
                Profile
              </Link>
              <div className="flex items-center gap-6 ml-4">
                <span className="text-[#a0aec0] text-sm font-medium px-4 py-2 bg-[rgba(0,212,255,0.1)] rounded-full border border-[rgba(0,212,255,0.2)]">
                  Welcome, {user.username}!
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-[rgba(255,0,110,0.1)] text-[#ff006e] border border-[rgba(255,0,110,0.3)] px-6 py-2 rounded-lg font-semibold text-xs uppercase tracking-wide transition-all hover:bg-[rgba(255,0,110,0.2)] hover:border-[#ff006e] hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(255,0,110,0.3)]"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 ml-4">
              <Link
                to="/login"
                className={`px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wide transition-all relative ${
                  isActive('/login')
                    ? 'text-[#00d4ff] bg-[rgba(0,212,255,0.15)] before:w-full'
                    : 'text-[#a0aec0] hover:text-white hover:bg-[rgba(0,212,255,0.1)]'
                } before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:h-0.5 before:bg-[#00d4ff] before:transition-all before:w-0 hover:before:w-4/5`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] text-white px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-[0_4px_15px_rgba(0,212,255,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(0,212,255,0.5)] hover:bg-gradient-to-r hover:from-[#7b2cbf] hover:to-[#00d4ff]"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
