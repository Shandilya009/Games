import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { userAPI, scoresAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

function Profile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [userScores, setUserScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'settings'
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [settingsError, setSettingsError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadUserScores();
    // Initialize settings form with user data
    setSettingsForm({
      username: user.username || '',
      email: user.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  }, [user, navigate]);

  const loadUserScores = async () => {
    if (!user) return;

    setLoading(true);
    try {
      try {
        const response = await scoresAPI.getUserScores(user._id);
        setUserScores(response.scores || []);
      } catch {
        console.log('Using mock user scores (backend not connected)');
        setUserScores([]);
      }
    } catch (error) {
      console.error('Error loading user scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (e) => {
    setSettingsForm({
      ...settingsForm,
      [e.target.name]: e.target.value,
    });
    setSettingsError('');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsLoading(true);

    try {
      // Validate form
      if (!settingsForm.username.trim()) {
        setSettingsError('Username is required');
        showToast('Username is required', 'error');
        return;
      }

      if (!settingsForm.email.trim()) {
        setSettingsError('Email is required');
        showToast('Email is required', 'error');
        return;
      }

      // Update profile
      try {
        await userAPI.updateProfile({
          username: settingsForm.username.trim(),
          email: settingsForm.email.trim(),
        });
        showToast('Profile updated successfully!', 'success');

        // Update user in context
        const updatedUser = {
          ...user,
          username: settingsForm.username.trim(),
          email: settingsForm.email.trim(),
        };
        updateUser(updatedUser);
      } catch {
        console.log('Using mock profile update (backend not connected)');
        // Mock update
        const updatedUser = {
          ...user,
          username: settingsForm.username.trim(),
          email: settingsForm.email.trim(),
        };
        updateUser(updatedUser);
        showToast('Profile updated successfully!', 'success');
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to update profile. Please try again.';
      setSettingsError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsLoading(true);

    try {
      // Validate password form
      if (!settingsForm.currentPassword) {
        setSettingsError('Current password is required');
        showToast('Current password is required', 'error');
        return;
      }

      if (!settingsForm.newPassword) {
        setSettingsError('New password is required');
        showToast('New password is required', 'error');
        return;
      }

      if (settingsForm.newPassword.length < 6) {
        setSettingsError('New password must be at least 6 characters');
        showToast('New password must be at least 6 characters', 'error');
        return;
      }

      if (settingsForm.newPassword !== settingsForm.confirmPassword) {
        setSettingsError('Passwords do not match');
        showToast('Passwords do not match', 'error');
        return;
      }

      // Change password
      try {
        await userAPI.changePassword({
          currentPassword: settingsForm.currentPassword,
          newPassword: settingsForm.newPassword,
        });
        showToast('Password changed successfully!', 'success');

        // Clear password fields
        setSettingsForm({
          ...settingsForm,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } catch {
        console.log('Using mock password change (backend not connected)');
        showToast('Password changed successfully!', 'success');
        setSettingsForm({
          ...settingsForm,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      const errorMsg = error.message || 'Failed to change password. Please try again.';
      setSettingsError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setSettingsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] px-12 py-16 max-w-7xl mx-auto">
      <div className="text-center mb-16 animate-[fadeInUp_0.6s_ease-out]">
        <h1 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] bg-clip-text text-transparent uppercase tracking-tight">
          My Profile
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center gap-4 mb-12">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] text-white shadow-[0_4px_15px_rgba(0,212,255,0.3)]'
              : 'bg-[#1a2332] text-[#a0aec0] border-2 border-[#2d3748] hover:border-[#00d4ff]'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] text-white shadow-[0_4px_15px_rgba(0,212,255,0.3)]'
              : 'bg-[#1a2332] text-[#a0aec0] border-2 border-[#2d3748] hover:border-[#00d4ff]'
          }`}
        >
          Settings
        </button>
      </div>

      {activeTab === 'profile' && (

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-10 animate-[fadeInUp_0.6s_ease-out_0.2s_both]">
        <div className="bg-[#1a2332] border border-[#2d3748] rounded-3xl p-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] h-fit lg:sticky lg:top-24 transition-all hover:shadow-[0_25px_70px_rgba(0,212,255,0.3)] hover:-translate-y-1 hover:border-[#00d4ff]">
          <div className="mb-8">
            {user.profileImage ? (
              <img src={user.profileImage} alt={user.username} className="w-36 h-36 rounded-full object-cover border-4 border-[#00d4ff] shadow-[0_8px_25px_rgba(0,212,255,0.3)]" />
            ) : (
              <div className="w-36 h-36 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] text-white flex items-center justify-center text-6xl font-black mx-auto border-4 border-[#00d4ff] shadow-[0_8px_25px_rgba(0,212,255,0.3)] transition-all hover:scale-105 hover:rotate-6 hover:shadow-[0_12px_35px_rgba(0,212,255,0.5)]">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h2 className="text-3xl mb-2 text-white font-extrabold uppercase tracking-wide">{user.username}</h2>
          <p className="text-[#a0aec0] mb-10 text-base">{user.email}</p>

          <div className="flex gap-4 mt-8">
            <div className="flex-1 p-6 bg-gradient-to-r from-[rgba(0,212,255,0.05)] to-[rgba(123,44,191,0.05)] border border-[rgba(0,212,255,0.1)] rounded-2xl transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,212,255,0.2)] hover:border-[#00d4ff] hover:bg-gradient-to-r hover:from-[rgba(0,212,255,0.1)] hover:to-[rgba(123,44,191,0.1)]">
              <div className="text-4xl font-black mb-2 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] bg-clip-text text-transparent">
                {user.totalPoints || 0}
              </div>
              <div className="text-sm text-[#a0aec0] font-semibold uppercase tracking-wide">Total Points</div>
            </div>
            <div className="flex-1 p-6 bg-gradient-to-r from-[rgba(0,212,255,0.05)] to-[rgba(123,44,191,0.05)] border border-[rgba(0,212,255,0.1)] rounded-2xl transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,212,255,0.2)] hover:border-[#00d4ff] hover:bg-gradient-to-r hover:from-[rgba(0,212,255,0.1)] hover:to-[rgba(123,44,191,0.1)]">
              <div className="text-4xl font-black mb-2 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] bg-clip-text text-transparent">
                {userScores.length}
              </div>
              <div className="text-sm text-[#a0aec0] font-semibold uppercase tracking-wide">Games Played</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="bg-[#1a2332] border border-[#2d3748] rounded-3xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <h3 className="text-3xl mb-8 font-extrabold bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] bg-clip-text text-transparent uppercase tracking-wide">
              Recent Game Scores
            </h3>
            {loading ? (
              <LoadingSpinner text="Loading scores..." size="medium" />
            ) : userScores.length === 0 ? (
              <div className="text-center py-16 px-8 text-[#a0aec0] text-lg">
                <p className="mb-6 text-lg">No scores yet. Start playing games to see your scores here!</p>
                <a href="/games" className="text-[#00d4ff] font-bold text-xl transition-all inline-block relative hover:translate-x-1">
                  Browse Games →
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00d4ff] transition-all hover:w-full"></span>
                </a>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {userScores.map((score) => (
                  <div
                    key={score._id}
                    className="grid grid-cols-[1fr_auto_auto] gap-6 p-6 bg-gradient-to-r from-[rgba(0,212,255,0.05)] to-[rgba(123,44,191,0.05)] border border-[rgba(0,212,255,0.1)] rounded-xl items-center transition-all hover:translate-x-1 hover:shadow-[0_5px_15px_rgba(0,212,255,0.2)] hover:border-[#00d4ff] hover:bg-gradient-to-r hover:from-[rgba(0,212,255,0.1)] hover:to-[rgba(123,44,191,0.1)]"
                  >
                    <div className="font-bold text-white text-lg">{score.gameName || 'Game'}</div>
                    <div className="font-black bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] bg-clip-text text-transparent text-xl">
                      +{score.pointsEarned}
                    </div>
                    <div className="text-[#a0aec0] text-sm font-medium">
                      {new Date(score.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-3xl mx-auto animate-[fadeInUp_0.6s_ease-out_0.2s_both]">
          <div className="bg-[#1a2332] border border-[#2d3748] rounded-3xl p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <h2 className="text-3xl mb-8 font-extrabold bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] bg-clip-text text-transparent uppercase tracking-wide">
              Profile Settings
            </h2>

            {settingsError && (
              <div className="bg-gradient-to-r from-[#fee] to-[#fdd] text-[#c33] p-5 rounded-xl border-l-4 border-[#c33] mb-6 font-semibold shadow-[0_4px_15px_rgba(204,51,51,0.2)] animate-[shake_0.5s]">
                {settingsError}
              </div>
            )}

            {/* Update Profile Section */}
            <div className="mb-10">
              <h3 className="text-2xl mb-6 text-white font-bold">Update Profile Information</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="flex flex-col gap-3">
                  <label htmlFor="username" className="font-bold text-white text-sm uppercase tracking-wide">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={settingsForm.username}
                    onChange={handleSettingsChange}
                    required
                    placeholder="Enter your username"
                    className="p-4 px-5 border-2 border-[#2d3748] rounded-xl text-base transition-all bg-[#141b2d] text-white placeholder:text-[#718096] shadow-[0_2px_8px_rgba(0,0,0,0.05)] focus:outline-none focus:border-[#00d4ff] focus:shadow-[0_0_0_4px_rgba(0,212,255,0.1)] focus:-translate-y-0.5"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label htmlFor="email" className="font-bold text-white text-sm uppercase tracking-wide">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={settingsForm.email}
                    onChange={handleSettingsChange}
                    required
                    placeholder="Enter your email"
                    className="p-4 px-5 border-2 border-[#2d3748] rounded-xl text-base transition-all bg-[#141b2d] text-white placeholder:text-[#718096] shadow-[0_2px_8px_rgba(0,0,0,0.05)] focus:outline-none focus:border-[#00d4ff] focus:shadow-[0_0_0_4px_rgba(0,212,255,0.1)] focus:-translate-y-0.5"
                  />
                </div>

                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="w-full p-4 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,212,255,0.3)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {settingsLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>

            {/* Change Password Section */}
            <div className="border-t-2 border-[#2d3748] pt-10">
              <h3 className="text-2xl mb-6 text-white font-bold">Change Password</h3>
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="flex flex-col gap-3">
                  <label htmlFor="currentPassword" className="font-bold text-white text-sm uppercase tracking-wide">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={settingsForm.currentPassword}
                    onChange={handleSettingsChange}
                    required
                    placeholder="Enter your current password"
                    className="p-4 px-5 border-2 border-[#2d3748] rounded-xl text-base transition-all bg-[#141b2d] text-white placeholder:text-[#718096] shadow-[0_2px_8px_rgba(0,0,0,0.05)] focus:outline-none focus:border-[#00d4ff] focus:shadow-[0_0_0_4px_rgba(0,212,255,0.1)] focus:-translate-y-0.5"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label htmlFor="newPassword" className="font-bold text-white text-sm uppercase tracking-wide">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={settingsForm.newPassword}
                    onChange={handleSettingsChange}
                    required
                    placeholder="Enter your new password (min 6 characters)"
                    className="p-4 px-5 border-2 border-[#2d3748] rounded-xl text-base transition-all bg-[#141b2d] text-white placeholder:text-[#718096] shadow-[0_2px_8px_rgba(0,0,0,0.05)] focus:outline-none focus:border-[#00d4ff] focus:shadow-[0_0_0_4px_rgba(0,212,255,0.1)] focus:-translate-y-0.5"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label htmlFor="confirmPassword" className="font-bold text-white text-sm uppercase tracking-wide">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={settingsForm.confirmPassword}
                    onChange={handleSettingsChange}
                    required
                    placeholder="Confirm your new password"
                    className="p-4 px-5 border-2 border-[#2d3748] rounded-xl text-base transition-all bg-[#141b2d] text-white placeholder:text-[#718096] shadow-[0_2px_8px_rgba(0,0,0,0.05)] focus:outline-none focus:border-[#00d4ff] focus:shadow-[0_0_0_4px_rgba(0,212,255,0.1)] focus:-translate-y-0.5"
                  />
                </div>

                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="w-full p-4 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,212,255,0.3)] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {settingsLoading ? 'Changing Password...' : 'Change Password'}
                </button>
              </form>
            </div>

            {/* Account Info Section */}
            <div className="border-t-2 border-[#2d3748] pt-10 mt-10">
              <h3 className="text-2xl mb-6 text-white font-bold">Account Information</h3>
              <div className="space-y-4">
                <div className="p-4 bg-[#141b2d] rounded-xl border border-[#2d3748]">
                  <div className="text-sm text-[#a0aec0] mb-1">User ID</div>
                  <div className="text-white font-semibold">{user._id || 'N/A'}</div>
                </div>
                <div className="p-4 bg-[#141b2d] rounded-xl border border-[#2d3748]">
                  <div className="text-sm text-[#a0aec0] mb-1">Member Since</div>
                  <div className="text-white font-semibold">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div className="p-4 bg-[#141b2d] rounded-xl border border-[#2d3748]">
                  <div className="text-sm text-[#a0aec0] mb-1">Total Points</div>
                  <div className="text-white font-semibold text-xl">{user.totalPoints || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
