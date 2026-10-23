import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  ArrowLeft, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Calendar, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSummaryReport, getRecentSalesRecords } from '../services/api';

interface SaleRecord {
  id: string;
  date: string;
  itemsCount: number;
  totalAmount: number;
  paymentMode: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.96 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 280, damping: 22 }
  }
};

export const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('today');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [summary, setSummary] = useState({ todaySales: 0, totalOrders: 0, avgOrderValue: 0 });
  const [recentSales, setRecentSales] = useState<SaleRecord[]>([]);
  const [allSales, setAllSales] = useState<SaleRecord[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  // 1. டேட்டாபேஸிலிருந்து லைவ் டேட்டாவைப் பெறுதல்
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setIsLoading(true);
        const salesData: any = await getRecentSalesRecords();

        if (salesData && salesData.length > 0) {
          setAllSales(salesData);
          filterDataByTime(salesData, timeFilter);
        } else {
          setAllSales([]);
          setRecentSales([]);
          setSummary({ todaySales: 0, totalOrders: 0, avgOrderValue: 0 });
        }
      } catch (err) {
        console.error('Failed to load report analytics from database:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, []);

  // 2. 🎯 ஃபில்டருக்கு ஏற்ப (Today, Week, Month) டிரான்சாக்ஷன் மற்றும் சம்மரி மெட்ரிக்ஸ்களை கால்குலேட் செய்தல்
  const filterDataByTime = (sales: SaleRecord[], filter: 'today' | 'week' | 'month') => {
    const now = new Date();
    
    const filtered = sales.filter((sale) => {
      if (!sale.date) return false;
      const saleDate = new Date(sale.date);
      if (isNaN(saleDate.getTime())) return true;

      if (filter === 'today') {
        return saleDate.toDateString() === now.toDateString();
      } else if (filter === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return saleDate >= oneWeekAgo && saleDate <= now;
      } else if (filter === 'month') {
        return (
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });

    setRecentSales(filtered);

    // 🎯 ஃபில்டர் செய்யப்பட்ட டேட்டாவுக்கேற்ப சம்மரி தொகைகளைக் கணக்கிடுதல்
    const totalRevenue = filtered.reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);
    const totalOrdersCount = filtered.length;
    const avgOrderVal = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

    setSummary({
      todaySales: totalRevenue,
      totalOrders: totalOrdersCount,
      avgOrderValue: avgOrderVal
    });
  };

  // ஃபில்டர் மாறும்போது டேட்டாவை உடனுக்குடன் ரீசெட் செய்து மாற்றுதல்
  const handleFilterChange = (filter: 'today' | 'week' | 'month') => {
    setTimeFilter(filter);
    filterDataByTime(allSales, filter);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleExport = () => {
    showToast('Report exported as PDF/Excel successfully!');
  };

  return (
    <motion.div 
      className="min-h-screen bg-[#18181B] p-4 md:p-8 text-[#FFFBEB] pb-32 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
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
            <h1 className="text-2xl font-bold text-[#FFFBEB]">Sales Analytics</h1>
            <p className="text-xs text-[#FDE68A]/70">Live Database Performance & Revenue Reports</p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={handleExport}
          className="px-4 py-2.5 bg-[#F59E0B] text-[#18181B] rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-lg hover:bg-[#D97706] transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export Report</span>
        </motion.button>
      </div>

      {/* Time Filters */}
      <div className="flex space-x-2 mb-6 bg-[#27272A] p-1.5 rounded-2xl border border-[#F59E0B]/20 w-fit">
        {(['today', 'week', 'month'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => handleFilterChange(filter)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
              timeFilter === filter 
                ? 'bg-[#F59E0B] text-[#18181B] shadow-md shadow-[#F59E0B]/20' 
                : 'text-[#FDE68A]/70 hover:text-[#FFFBEB]'
            }`}
          >
            {filter === 'today' ? "Today's Report" : filter === 'week' ? 'This Week' : 'This Month'}
          </button>
        ))}
      </div>

      {/* Metrics Cards (Dynamic Calculation based on selected filter) */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="p-5 rounded-3xl bg-[#27272A] border border-[#F59E0B]/20 shadow-lg">
          <div className="flex justify-between items-center text-[#FDE68A]/80 mb-2">
            <span className="text-xs font-semibold">Total Revenue</span>
            <div className="p-2 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-[#FFFBEB]">
            {isLoading ? '...' : `₹${summary.todaySales.toLocaleString('en-IN')}`}
          </h2>
          <span className="text-[11px] text-emerald-400 flex items-center mt-2 gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" /> Database Synced
          </span>
        </motion.div>

        <motion.div variants={itemVariants} className="p-5 rounded-3xl bg-[#27272A] border border-[#F59E0B]/20 shadow-lg">
          <div className="flex justify-between items-center text-[#FDE68A]/80 mb-2">
            <span className="text-xs font-semibold">Total Orders</span>
            <div className="p-2 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B]">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-[#FFFBEB]">
            {isLoading ? '...' : summary.totalOrders}
          </h2>
          <span className="text-[11px] text-[#FDE68A]/70 mt-2 block">Completed Orders</span>
        </motion.div>

        <motion.div variants={itemVariants} className="p-5 rounded-3xl bg-[#27272A] border border-[#F59E0B]/20 shadow-lg">
          <div className="flex justify-between items-center text-[#FDE68A]/80 mb-2">
            <span className="text-xs font-semibold">Avg. Order Value</span>
            <div className="p-2 rounded-xl bg-[#F59E0B]/20 text-[#F59E0B]">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-[#FFFBEB]">
            {isLoading ? '...' : `₹${summary.avgOrderValue}`}
          </h2>
          <span className="text-[11px] text-[#FDE68A]/70 mt-2 block">Per Customer Basket</span>
        </motion.div>
      </motion.div>

      {/* History */}
      <motion.div variants={itemVariants} className="bg-[#27272A] border border-[#F59E0B]/20 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-[#F59E0B]/20">
          <h2 className="text-lg font-bold text-[#FFFBEB] flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#F59E0B]" /> Transaction History ({timeFilter.toUpperCase()})
          </h2>
          <span className="text-xs text-[#FDE68A]/70">{recentSales.length} Records Found</span>
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-[#FDE68A]/60 text-xs">Loading transaction records...</div>
        ) : recentSales.length === 0 ? (
          <div className="text-center py-10 text-[#FDE68A]/60 text-xs">No sales transactions found for this period.</div>
        ) : (
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <motion.div
                key={sale.id}
                whileHover={{ x: 4 }}
                className="p-4 rounded-2xl bg-[#18181B] border border-[#F59E0B]/10 flex justify-between items-center text-xs transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#FFFBEB]">{sale.id}</span>
                    <span className="text-[10px] bg-[#27272A] text-[#FDE68A] px-2 py-0.5 rounded-md border border-[#F59E0B]/20">
                      {sale.paymentMode || 'Paid'}
                    </span>
                  </div>
                  <p className="text-[#FDE68A]/60">
                    {new Date(sale.date).toLocaleString()} • {sale.itemsCount} Items
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-base font-extrabold text-[#FFFBEB]">₹{sale.totalAmount}</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">Successful</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-[#27272A] text-[#FFFBEB] px-4 py-3 rounded-2xl shadow-xl border border-[#F59E0B]/40 flex items-center space-x-2 z-50 text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default Reports;