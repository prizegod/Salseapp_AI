import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Scan, 
  ArrowUpRight, 
  Zap, 
  CreditCard,
  BarChart3,
  Store
} from 'lucide-react';
import { getSummaryReport } from '../services/api'; // 🎯 API-லிருந்து டேட்டா பெற இறக்குமதி செய்யப்பட்டுள்ளது

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 20 }
  },
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // 🎯 டேட்டாபேஸ் தரவுகளைச் சேமிக்க State உருவாக்கம்
  const [summaryData, setSummaryData] = useState({
    todaySales: 0,
    totalProducts: 0,
    totalOrders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 🎯 டேஷ்போர்ட் திறந்தவுடன் டேட்டாபேஸிலிருந்து லைவ் டேட்டாவை Fetch செய்தல்
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data: any = await getSummaryReport();
        if (data) {
          setSummaryData({
            todaySales: data.todaySales || data.totalRevenue || 0,
            totalProducts: data.totalProducts || 0,
            totalOrders: data.totalOrders || 0,
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard summary data from database:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <motion.div 
      className="min-h-screen bg-[#18181B] p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-24 text-[#FFFBEB]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 🚀 Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Revenue Banner */}
        <motion.div 
          variants={cardVariants}
          className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F59E0B] via-[#D97706] to-[#78350F] p-6 md:p-8 shadow-xl shadow-[#F59E0B]/10 text-[#18181B] flex flex-col justify-between"
        >
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs md:text-sm uppercase tracking-wider text-[#18181B]/80 font-bold">Today's Revenue</p>
              <h1 className="text-4xl md:text-5xl font-black text-[#18181B] mt-1">
                {isLoading ? 'Loading...' : `₹${summaryData.todaySales.toLocaleString('en-IN')}`}
              </h1>
            </div>
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="p-3.5 bg-[#18181B]/10 backdrop-blur-md rounded-2xl border border-black/10 text-[#18181B]"
            >
              <TrendingUp className="w-7 h-7" />
            </motion.div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-black/10">
            <div className="flex items-center space-x-2 text-xs md:text-sm font-bold bg-[#18181B]/10 px-3 py-1.5 rounded-full">
              <ArrowUpRight className="w-4 h-4" />
              <span>Database Live Sync</span>
            </div>
            <span className="text-xs font-semibold text-[#18181B]/70">ShopSale POS Secure</span>
          </div>
        </motion.div>

        {/* Cloud Status Card */}
        <motion.div 
          variants={cardVariants}
          className="p-6 rounded-3xl bg-[#27272A] border border-[#F59E0B]/20 shadow-lg flex flex-col justify-between"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="relative p-3 rounded-2xl bg-[#F59E0B]/20 text-[#F59E0B]">
              <Zap className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F59E0B]"></span>
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#FFFBEB]">Cloud System</h3>
              <p className="text-xs text-[#FDE68A]/70">Multi-Store Live Sync</p>
            </div>
          </div>
          <div className="space-y-2 text-xs text-[#FDE68A] bg-[#18181B] p-3 rounded-2xl border border-[#F59E0B]/20">
            <div className="flex justify-between">
              <span>Backend Server:</span>
              <span className="text-emerald-400 font-bold">Connected (.NET)</span>
            </div>
            <div className="flex justify-between">
              <span>Database Engine:</span>
              <span className="text-[#F59E0B] font-bold">SQLite Active</span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* ⚡ Quick Actions Grid */}
      <motion.div variants={cardVariants} className="space-y-3">
        <h2 className="text-xs font-bold text-[#FDE68A]/80 uppercase tracking-widest px-1">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ y: -4 }}
            onClick={() => navigate('/sales')}
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[#27272A] border border-[#F59E0B]/20 shadow-lg hover:border-[#F59E0B] transition-all active:bg-[#3F3F46] cursor-pointer"
          >
            <div className="p-3.5 rounded-2xl bg-[#F59E0B] text-[#18181B] mb-3 shadow-md font-bold">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <span className="text-sm font-bold text-[#FFFBEB]">New Sale</span>
            <span className="text-[11px] text-[#FDE68A]/70 mt-0.5">Quick Checkout</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ y: -4 }}
            onClick={() => navigate('/scanner')}
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[#27272A] border border-[#F59E0B]/20 shadow-lg hover:border-[#F59E0B] transition-all active:bg-[#3F3F46] cursor-pointer"
          >
            <div className="p-3.5 rounded-2xl bg-[#F59E0B] text-[#18181B] mb-3 shadow-md font-bold">
              <Scan className="w-7 h-7" />
            </div>
            <span className="text-sm font-bold text-[#FFFBEB]">AI Scanner</span>
            <span className="text-[11px] text-[#FDE68A]/70 mt-0.5">Scan Bills</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ y: -4 }}
            onClick={() => navigate('/products')}
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[#27272A] border border-[#F59E0B]/20 shadow-lg hover:border-[#F59E0B] transition-all active:bg-[#3F3F46] cursor-pointer"
          >
            <div className="p-3.5 rounded-2xl bg-[#F59E0B] text-[#18181B] mb-3 shadow-md font-bold">
              <Package className="w-7 h-7" />
            </div>
            <span className="text-sm font-bold text-[#FFFBEB]">Inventory</span>
            <span className="text-[11px] text-[#FDE68A]/70 mt-0.5">Manage Items</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ y: -4 }}
            onClick={() => navigate('/reports')}
            className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[#27272A] border border-[#F59E0B]/20 shadow-lg hover:border-[#F59E0B] transition-all active:bg-[#3F3F46] cursor-pointer"
          >
            <div className="p-3.5 rounded-2xl bg-[#F59E0B] text-[#18181B] mb-3 shadow-md font-bold">
              <BarChart3 className="w-7 h-7" />
            </div>
            <span className="text-sm font-bold text-[#FFFBEB]">Analytics</span>
            <span className="text-[11px] text-[#FDE68A]/70 mt-0.5">Sales Reports</span>
          </motion.button>

        </div>
      </motion.div>

      {/* 📊 Metrics Overview */}
      <motion.div variants={cardVariants} className="space-y-3">
        <h2 className="text-xs font-bold text-[#FDE68A]/80 uppercase tracking-widest px-1">Overview Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          
          <motion.div 
            whileHover={{ y: -3 }}
            onClick={() => navigate('/products')}
            className="p-5 rounded-2xl bg-[#27272A]/60 border border-[#F59E0B]/20 flex items-center space-x-4 cursor-pointer hover:bg-[#27272A] transition-all"
          >
            <div className="p-3 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B]">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-[#FDE68A]/70">Products</p>
              <p className="text-xl font-bold text-[#FFFBEB]">{summaryData.totalProducts}</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -3 }}
            onClick={() => navigate('/reports')}
            className="p-5 rounded-2xl bg-[#27272A]/60 border border-[#F59E0B]/20 flex items-center space-x-4 cursor-pointer hover:bg-[#27272A] transition-all"
          >
            <div className="p-3 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B]">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-[#FDE68A]/70">Total Orders</p>
              <p className="text-xl font-bold text-[#FFFBEB]">{summaryData.totalOrders}</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -3 }}
            className="p-5 rounded-2xl bg-[#27272A]/60 border border-[#F59E0B]/20 flex items-center space-x-4 col-span-2 md:col-span-1"
          >
            <div className="p-3 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B]">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-[#FDE68A]/70">Active Store</p>
              <p className="text-xl font-bold text-[#FFFBEB]">Isolated User</p>
            </div>
          </motion.div>

        </div>
      </motion.div>

    </motion.div>
  );
};

export default Dashboard;