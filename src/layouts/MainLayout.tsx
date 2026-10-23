import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Scan, 
  BarChart3, 
  LogOut,
  Store,
  User // 🎯 Profile ஐகான் சேர்க்கப்பட்டுள்ளது
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Sale', path: '/sales', icon: ShoppingCart },
    { name: 'Scanner', path: '/scanner', icon: Scan },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Profile', path: '/profile', icon: User }, // 🎯 புதிய Profile மெனு சேர்க்கப்பட்டுள்ளது
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#18181B] text-[#FFFBEB] flex flex-col lg:flex-row relative overflow-x-hidden">
      
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
          className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-all border border-rose-500/20 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </aside>

      {/* 📱 Main Content Area */}
      <main className="flex-1 w-full relative min-h-screen pb-24 lg:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </main>

      {/* 📱 Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#18181B]/95 backdrop-blur-lg border-t border-[#F59E0B]/20 px-2 py-2 z-40 flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center p-2 rounded-xl transition-all cursor-pointer"
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTabAmber"
                  className="absolute inset-0 bg-[#F59E0B] rounded-xl -z-10 shadow-md shadow-[#F59E0B]/20"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#18181B]' : 'text-[#FDE68A]/60'}`} />
              <span className={`text-[9px] font-semibold mt-1 ${isActive ? 'text-[#18181B] font-bold' : 'text-[#FDE68A]/60'}`}>
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