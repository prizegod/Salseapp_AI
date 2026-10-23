import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  User, 
  Lock, 
  Save, 
  Shield, 
  CheckCircle2, 
  AlertCircle,
  Store as StoreIcon,
  LogOut 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const Profile: React.FC = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState(''); // 🔒 Username (ReadOnly)
  const [displayName, setDisplayName] = useState(''); // ✏️ Input Field Name
  const [savedDisplayName, setSavedDisplayName] = useState(''); // 🛡️ Header-ல் காட்டும் Saved Name
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [role, setRole] = useState('');
  const [storeName, setStoreName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUsername(user.username || '');
        const currentName = user.displayName || user.username || '';
        setDisplayName(currentName);
        setSavedDisplayName(currentName); // ஆரம்பத்தில் சேமிக்கப்பட்ட பெயரைக் காட்டுதல்
        setRole(user.role || 'User');
        setStoreName(user.storeName || 'My Store');
        setAvatarUrl(user.picture || ''); // Google Profile Picture URL
      }
    } catch (err) {
      console.error('Failed to load user info:', err);
    }
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const payload: any = { displayName };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const response: any = await api.put('/users/profile', payload);

      if (response.data) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.displayName = displayName;
          localStorage.setItem('user', JSON.stringify(user));
        }

        // 🎯 Save பட்டனை அழுத்தி வெற்றிகரமாக முடிந்த பிறகு மட்டுமே ஹெடரில் பெயர் மாறும்
        setSavedDisplayName(displayName);

        setMessage({ text: 'Profile name updated successfully!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err: any) {
      console.error('Update Profile Error:', err);
      setMessage({ 
        text: err.response?.data?.message || 'Failed to update profile. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <motion.div 
      className="min-h-screen bg-[#18181B] p-3 sm:p-6 text-[#FFFBEB] pb-32 max-w-lg md:max-w-2xl mx-auto overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/dashboard')}
            className="p-2.5 rounded-2xl bg-[#27272A] border border-[#F59E0B]/20 text-[#FDE68A] cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#FFFBEB] flex items-center gap-2">
              User Profile <User className="w-5 h-5 text-[#F59E0B]" />
            </h1>
            <p className="text-[11px] sm:text-xs text-[#FDE68A]/70">Manage account details & security</p>
          </div>
        </div>
      </div>

      <div className="bg-[#27272A] border border-[#F59E0B]/20 rounded-3xl p-4 sm:p-6 shadow-xl space-y-5">
        
        {/* User Badge with Google Profile Picture */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 p-4 rounded-2xl bg-[#18181B] border border-[#F59E0B]/10 text-center sm:text-left">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Google Profile" className="w-16 h-16 rounded-2xl object-cover border border-[#F59E0B]/30 shadow-md" />
          ) : (
            <div className="p-3.5 rounded-2xl bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
              <User className="w-7 h-7" />
            </div>
          )}
          <div className="overflow-hidden">
            {/* 🎯 இங்கு savedDisplayName பயன்படுத்தப்படுவதால் சப்மிட் செய்த பிறகே பெயர் மாறும் */}
            <h2 className="text-base sm:text-lg font-bold text-[#FFFBEB] truncate">{savedDisplayName || username || 'User'}</h2>
            <p className="text-xs text-[#FDE68A]/60 font-mono">@{username}</p>
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-1.5 mt-1.5">
              <span className="text-[10px] bg-[#27272A] text-[#F59E0B] px-2 py-0.5 rounded-md border border-[#F59E0B]/20 flex items-center gap-1">
                <Shield className="w-3 h-3" /> {role}
              </span>
              <span className="text-[10px] bg-[#27272A] text-[#FDE68A] px-2 py-0.5 rounded-md border border-[#F59E0B]/20 flex items-center gap-1">
                <StoreIcon className="w-3 h-3" /> {storeName}
              </span>
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 border ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span className="break-words">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          {/* 🔒 Read-only Unique Username */}
          <div>
            <label className="block text-xs font-semibold text-[#FDE68A]/80 mb-1.5">Username (Unique ID - Cannot be changed)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#FDE68A]/40">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                disabled
                className="w-full pl-10 pr-4 py-3 bg-[#111113] border border-[#F59E0B]/10 rounded-2xl text-xs text-[#FDE68A]/50 cursor-not-allowed select-none"
              />
            </div>
          </div>

          {/* ✏️ Editable Display Name */}
          <div>
            <label className="block text-xs font-semibold text-[#FDE68A]/80 mb-1.5">Display Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#FDE68A]/40">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-[#18181B] border border-[#F59E0B]/20 rounded-2xl text-xs text-[#FFFBEB] focus:outline-none focus:border-[#F59E0B] transition-all"
                placeholder="Enter your display name"
              />
            </div>
          </div>

          <div className="border-t border-[#F59E0B]/10 pt-3">
            <h3 className="text-xs sm:text-sm font-bold text-[#FFFBEB] mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#F59E0B]" /> Change Password (Optional)
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#FDE68A]/80 mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#18181B] border border-[#F59E0B]/20 rounded-2xl text-xs text-[#FFFBEB] focus:outline-none focus:border-[#F59E0B] transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FDE68A]/80 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#18181B] border border-[#F59E0B]/20 rounded-2xl text-xs text-[#FFFBEB] focus:outline-none focus:border-[#F59E0B] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 space-y-3">
            <motion.button
              type="submit"
              whileTap={{ scale: 0.96 }}
              disabled={isLoading}
              className="w-full py-3.5 bg-[#F59E0B] text-[#18181B] rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-[#F59E0B]/20 hover:bg-[#D97706] transition-all cursor-pointer text-xs sm:text-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Updating...' : 'Save Changes'}</span>
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={handleLogout}
              className="w-full py-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-rose-500/20 transition-all cursor-pointer text-xs sm:text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default Profile;