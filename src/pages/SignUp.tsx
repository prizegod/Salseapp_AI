import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Store, Mail, Lock, User as UserIcon, Store as StoreIcon, ArrowRight, Loader2 } from 'lucide-react';
import { registerUser } from '../services/api'; // 🎯 Backend API Import

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 280, damping: 22 }
  }
};

export const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    storeName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 🎯 C# Backend API வழியாக புதிய பயனரை உருவாக்கும் செயல்பாடு
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. C# Backend-க்கு பயனர் தகவல்களை அனுப்புதல் (Role: Agent என அமைக்கப்படுகிறது)
      await registerUser({
        username: formData.username.trim(),
        fullName: formData.fullName,
        storeName: formData.storeName,
        email: formData.email.trim(),
        password: formData.password,
        role: 'Agent' // 👈 அட்மினாக மாறாமல் சாதாரண பயனராக (Agent) சேமிக்கப்படும்
      });

      // 2. வெற்றிகரமாகப் பதிவு செய்யப்பட்டவுடன் லாகின் பக்கத்திற்குச் செல்லுதல்
      alert('கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது! தயவுசெய்து லாகின் செய்யவும்.');
      navigate('/');
    } catch (err: any) {
      console.error('SignUp Error:', err);
      if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'இந்த பயனர் பெயர் அல்லது மின்னஞ்சல் ஏற்கனவே உள்ளது.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('C# Backend Server உடன் இணைய முடியவில்லை. Port 5000 இயங்குகிறதா என பார்க்கவும்.');
      } else {
        setError(err.response?.data?.message || 'கணக்கு உருவாக்குவதில் பிழை ஏற்பட்டது.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    // Google Demo லாகின் சாதாரண Agent பயனர் ரோலுடன்
    localStorage.setItem('user', JSON.stringify({ username: 'user@gmail.com', role: 'Agent' }));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#112D4E] flex items-center justify-center p-4 text-[#F9F7F7]">
      <motion.div 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-[#3F72AF]/10 border border-[#3F72AF]/30 backdrop-blur-xl p-8 rounded-3xl shadow-2xl space-y-6"
      >
        {/* Brand Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-[#3F72AF] text-[#F9F7F7] shadow-lg mb-2">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#F9F7F7]">Create Account</h1>
          <p className="text-xs text-[#DBE2EF]">Start managing your store with ShopSale POS</p>
        </div>

        {/* ⚠️ எரர் செய்தி */}
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
        <form onSubmit={handleSignUp} className="space-y-3">
          {/* Username (C# API-க்கு அவசியமானது) */}
          <div>
            <label className="text-xs font-semibold text-[#DBE2EF] mb-1 block">Username</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-3.5 w-4 h-4 text-[#DBE2EF]/60" />
              <input 
                type="text" 
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="johndoe123"
                className="w-full pl-11 pr-4 py-2.5 bg-[#3F72AF]/15 border border-[#3F72AF]/30 rounded-2xl text-[#F9F7F7] placeholder-[#DBE2EF]/40 focus:outline-none focus:border-[#DBE2EF] text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#DBE2EF] mb-1 block">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-3.5 w-4 h-4 text-[#DBE2EF]/60" />
              <input 
                type="text" 
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="John Doe"
                className="w-full pl-11 pr-4 py-2.5 bg-[#3F72AF]/15 border border-[#3F72AF]/30 rounded-2xl text-[#F9F7F7] placeholder-[#DBE2EF]/40 focus:outline-none focus:border-[#DBE2EF] text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#DBE2EF] mb-1 block">Store Name</label>
            <div className="relative">
              <StoreIcon className="absolute left-4 top-3.5 w-4 h-4 text-[#DBE2EF]/60" />
              <input 
                type="text" 
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                placeholder="My Retail Supermart"
                className="w-full pl-11 pr-4 py-2.5 bg-[#3F72AF]/15 border border-[#3F72AF]/30 rounded-2xl text-[#F9F7F7] placeholder-[#DBE2EF]/40 focus:outline-none focus:border-[#DBE2EF] text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#DBE2EF] mb-1 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-[#DBE2EF]/60" />
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@store.com"
                className="w-full pl-11 pr-4 py-2.5 bg-[#3F72AF]/15 border border-[#3F72AF]/30 rounded-2xl text-[#F9F7F7] placeholder-[#DBE2EF]/40 focus:outline-none focus:border-[#DBE2EF] text-sm transition-all"
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-2.5 bg-[#3F72AF]/15 border border-[#3F72AF]/30 rounded-2xl text-[#F9F7F7] placeholder-[#DBE2EF]/40 focus:outline-none focus:border-[#DBE2EF] text-sm transition-all"
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#3F72AF] text-[#F9F7F7] font-bold rounded-2xl shadow-lg hover:bg-[#3F72AF]/80 transition-all flex items-center justify-center space-x-2 text-sm mt-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Store Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-[#3F72AF]/30 w-full" />
          <span className="bg-[#112D4E] px-3 text-[11px] text-[#DBE2EF]/70 uppercase font-semibold absolute">Or</span>
        </div>

        {/* Google Sign-Up Button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={handleGoogleSignUp}
          className="w-full py-3 bg-[#112D4E] border border-[#3F72AF]/40 rounded-2xl flex items-center justify-center space-x-3 text-xs font-bold text-[#F9F7F7] hover:bg-[#3F72AF]/20 transition-all shadow-md"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z" />
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9c-.2-.7-.4-1.5-.4-2.3z" />
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16c1.8 3.7 5.6 6.3 10.1 6.3z" />
          </svg>
          <span>Sign Up with Google</span>
        </motion.button>

        {/* Navigation to Login */}
        <p className="text-center text-xs text-[#DBE2EF]">
          Already have an account?{' '}
          <button 
            type="button"
            onClick={() => navigate('/')}
            className="text-[#F9F7F7] font-bold hover:underline"
          >
            Log In
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUp;