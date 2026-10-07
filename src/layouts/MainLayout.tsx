import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Scan, 
  BarChart3, 
  LogOut,
  Store,
  Loader2,
  Zap
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 🎯 Backend / Route Loading State
  const [isLoading, setIsLoading] = useState(false);

  // 🚀 பக்கங்கள் மாறும்போதும் (Route changes) தரவு லோட் ஆகும்போதும் Loader இயங்கும்
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // 800ms அனிமேஷன் தாமதம் (Backend API லோடிங்கை குறிக்க)

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Sale', path: '/sales', icon: ShoppingCart },
    { name: 'Scanner', path: '/scanner', icon: Scan },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#18181B] text-[#FFFBEB] flex flex-col lg:flex-row relative overflow-x-hidden">
      
      {/* ⚡ 1. Global Page Top Progress Loader Bar */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F59E0B] via-[#FDE68A] to-[#D97706] z-50 origin-left shadow-[0_0_12px_#F59E0B]"
          />
        )}
      </AnimatePresence>

      {/* 🖥️ Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col justify-between w-64 bg-[#27272A]/80 border-r border-[#F59E0B]/20 p-6 h-screen sticky top-0 backdrop-blur-md z-40">
        <div className="space-y-8">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 px-2">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-[#18181B] shadow-lg shadow-[#F59E0B]/20 font-bold">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#FFFBEB]">ShopSale POS</h1>
              <p className="text-[10px] text-[#FDE68A]">Amber Gold Edition</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all relative ${
                    isActive 
                      ? 'text-[#18181B] bg-[#F59E0B] shadow-lg shadow-[#F59E0B]/20 font-bold' 
                      : 'text-[#FDE68A]/80 hover:bg-[#27272A] hover:text-[#FFFBEB]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-all border border-rose-500/20"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </aside>

      {/* 📱 Main Content Area */}
      <main className="flex-1 w-full relative min-h-screen pb-24 lg:pb-8">
        
        {/* 🌟 2. Backend Loading State Animation Overlay */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-30 bg-[#18181B]/90 backdrop-blur-md flex flex-col items-center justify-center space-y-4 p-6"
            >
              {/* Glowing Pulse Circle */}
              <div className="relative flex items-center justify-center">
                <div className="absolute w-20 h-20 bg-[#F59E0B]/20 rounded-full animate-ping" />
                <div className="p-4 rounded-3xl bg-[#27272A] border border-[#F59E0B]/30 shadow-2xl text-[#F59E0B]">
                  <Zap className="w-8 h-8 animate-bounce" />
                </div>
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-[#FFFBEB] flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#F59E0B]" />
                  Syncing with Backend Server...
                </h3>
                <p className="text-xs text-[#FDE68A]/60">Loading store data & analytics</p>
              </div>

              {/* Skeleton Cards Preview Simulation */}
              <div className="w-full max-w-xl space-y-3 pt-6 opacity-40">
                <div className="h-28 bg-[#27272A] rounded-3xl animate-pulse border border-[#F59E0B]/10" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-20 bg-[#27272A] rounded-2xl animate-pulse border border-[#F59E0B]/10" />
                  <div className="h-20 bg-[#27272A] rounded-2xl animate-pulse border border-[#F59E0B]/10" />
                </div>
              </div>
            </motion.div>
          ) : (
            /* Main Content Display with Smooth Fade-In */
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* 📱 Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#18181B]/95 backdrop-blur-lg border-t border-[#F59E0B]/20 px-3 py-2 z-40 flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center p-2 rounded-xl transition-all"
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTabAmber"
                  className="absolute inset-0 bg-[#F59E0B] rounded-xl -z-10 shadow-md shadow-[#F59E0B]/20"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#18181B]' : 'text-[#FDE68A]/60'}`} />
              <span className={`text-[10px] font-semibold mt-1 ${isActive ? 'text-[#18181B] font-bold' : 'text-[#FDE68A]/60'}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>

    </div>
  );
};

export default MainLayout;