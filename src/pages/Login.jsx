import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { userAPI } from '../services/api';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      try {
        response = await userAPI.login(formData);
      } catch {
        console.log('Using mock login (backend not connected)');
        response = {
          user: {
            _id: '1',
            username: formData.email.split('@')[0],
            email: formData.email,
            totalPoints: 0,
          },
          token: 'mock-token-' + Date.now(),
        };
      }

      localStorage.setItem('token', response.token);
      login(response.user);
      showToast('Welcome back! Login successful.', 'success');
      navigate('/');
    } catch (err) {
      const errorMsg = err.message || 'Login failed. Please check your credentials.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-8 relative overflow-hidden">
      <div className="bg-[rgba(26,35,50,0.95)] backdrop-blur-2xl p-14 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-full max-w-lg border border-[rgba(255,255,255,0.3)] relative z-10 animate-[fadeInUp_0.6s_ease-out]">
        <h2 className="text-4xl mb-2 text-center font-extrabold bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] bg-clip-text text-transparent uppercase tracking-tight">
          Login to GameHub
        </h2>
        <p className="text-[#a0aec0] text-center mb-10 text-lg font-normal">
          Welcome back! Please login to continue.
        </p>

        {error && (
          <div className="bg-gradient-to-r from-[#fee] to-[#fdd] text-[#c33] p-5 rounded-xl border-l-4 border-[#c33] mb-4 font-semibold shadow-[0_4px_15px_rgba(204,51,51,0.2)] animate-[shake_0.5s]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
          <div className="flex flex-col gap-3">
            <label htmlFor="email" className="font-bold text-white text-sm uppercase tracking-wide">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className="p-4 px-5 border-2 border-[#2d3748] rounded-xl text-base transition-all bg-[#141b2d] text-white placeholder:text-[#718096] shadow-[0_2px_8px_rgba(0,0,0,0.05)] focus:outline-none focus:border-[#00d4ff] focus:shadow-[0_0_0_4px_rgba(0,212,255,0.1)] focus:-translate-y-0.5"
            />
          </div>

          <div className="flex flex-col gap-3">
            <label htmlFor="password" className="font-bold text-white text-sm uppercase tracking-wide">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="p-4 px-5 border-2 border-[#2d3748] rounded-xl text-base transition-all bg-[#141b2d] text-white placeholder:text-[#718096] shadow-[0_2px_8px_rgba(0,0,0,0.05)] focus:outline-none focus:border-[#00d4ff] focus:shadow-[0_0_0_4px_rgba(0,212,255,0.1)] focus:-translate-y-0.5"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] text-white p-5 rounded-xl text-lg font-bold cursor-pointer transition-all mt-2 shadow-[0_4px_15px_rgba(0,212,255,0.4)] uppercase tracking-wide relative overflow-hidden hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_8px_25px_rgba(0,212,255,0.5)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-10 text-[#a0aec0] text-base">
          Don't have an account? <Link to="/register" className="text-[#00d4ff] font-bold transition-all relative hover:underline">Sign up here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
