import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Store, User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { loginUser } from '../services/api';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 280, damping: 22 }
  }
};

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 🎯 1. ஏற்கனவே லாகின் செய்யப்பட்டிருந்தால் தானாகவே Dashboard-க்கு அழைத்துச் செல்லும் ஆட்டோ-ரீடைரக்ட்
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        const role = (user?.role || '').toLowerCase();
        if (role === 'admin') {
          navigate('/admin-dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (e) {
        console.error('Invalid saved user data:', e);
      }
    }
  }, [navigate]);

  // 🎯 2. லாகின் கையாளும் முதன்மை ஃபங்க்ஷன்
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser({ 
        username: username.trim(), 
        password: password 
      });
      
      if (data && data.token) {
        // LocalStorage-ல் சேமித்தல்
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        const userRole = (data.user?.role || '').toString().toLowerCase();

        // Role-க்கு ஏற்ப Redirect செய்தல்
        if (userRole === 'admin') {
          navigate('/admin-dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setError('சர்வரில் இருந்து டோக்கன் பெறப்படவில்லை!');
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      
      if (err.response?.status === 401) {
        setError('தவறான பயனர் பெயர் (Username) அல்லது கடவுச்சொல் (Password)!');
      } else if (err.code === 'ERR_NETWORK') {
        setError('C# Backend Server உடன் இணைய முடியவில்லை. (Port 5000 இயங்குகிறதா என பார்க்கவும்)');
      } else {
        setError(
          err.response?.data?.message || 
          'லாகின் செய்ய முடியவில்லை! மீண்டும் முயற்சிக்கவும்.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const demoUser = { username: 'user@gmail.com', role: 'Agent' };
    localStorage.setItem('user', JSON.stringify(demoUser));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#112D4E] flex items-center justify-center p-4 text-[#F9F7F7] relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#3F72AF]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#3F72AF]/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-[#3F72AF]/10 border border-[#3F72AF]/30 backdrop-blur-xl p-8 rounded-3xl shadow-2xl space-y-6 z-10"
      >
        {/* Brand Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-[#3F72AF] text-[#F9F7F7] shadow-lg mb-2">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#F9F7F7]">Welcome Back</h1>
          <p className="text-xs text-[#DBE2EF]">Sign in to continue to ShopSale POS</p>
        </div>

        {/* ⚠️ Error Alert Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs p-3 rounded-2xl text-center font-medium"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#DBE2EF] mb-1 block">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-4 h-4 text-[#DBE2EF]/60" />
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Username (e.g. admin)"
                className="w-full pl-11 pr-4 py-3 bg-[#3F72AF]/15 border border-[#3F72AF]/30 rounded-2xl text-[#F9F7F7] placeholder-[#DBE2EF]/40 focus:outline-none focus:border-[#DBE2EF] text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#DBE2EF] mb-1 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-4 h-4 text-[#DBE2EF]/60" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-[#3F72AF]/15 border border-[#3F72AF]/30 rounded-2xl text-[#F9F7F7] placeholder-[#DBE2EF]/40 focus:outline-none focus:border-[#DBE2EF] text-sm transition-all"
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#3F72AF] text-[#F9F7F7] font-bold rounded-2xl shadow-lg hover:bg-[#3F72AF]/80 transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting to Server...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-[#3F72AF]/30 w-full" />
          <span className="bg-[#112D4E] px-3 text-[11px] text-[#DBE2EF]/70 uppercase font-semibold absolute">Or</span>
        </div>

        {/* Google Sign-In Button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-3 bg-[#112D4E] border border-[#3F72AF]/40 rounded-2xl flex items-center justify-center space-x-3 text-xs font-bold text-[#F9F7F7] hover:bg-[#3F72AF]/20 transition-all shadow-md"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z" />
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9c-.2-.7-.4-1.5-.4-2.3z" />
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16c1.8 3.7 5.6 6.3 10.1 6.3z" />
          </svg>
          <span>Continue with Google</span>
        </motion.button>

        {/* Navigation to SignUp */}
        <p className="text-center text-xs text-[#DBE2EF]">
          Don't have an account?{' '}
          <button 
            type="button"
            onClick={() => navigate('/signup')}
            className="text-[#F9F7F7] font-bold hover:underline"
          >
            Sign Up
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;