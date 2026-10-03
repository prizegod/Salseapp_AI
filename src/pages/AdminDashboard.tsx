import React, { useEffect, useState } from 'react';
import { Users, Activity, Server, Clock, Cpu, BarChart3, RefreshCw, Sparkles, FileText } from 'lucide-react';
import api from '../services/api';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  // 🎯 பின்னணியில் அமைதியாகப் புதுப்பிக்கும் ஃபங்க்ஷன் (No Loader Flicker)
  const fetchMetricsSilent = () => {
    api.get('/AdminDashboard/system-metrics')
    .then(res => setMetrics(res.data))
    .catch(err => console.error('Silent refresh failed:', err));
  };

  useEffect(() => {
    // 1. முதன்முறை பக்கத்திற்கு வரும்போது மட்டும் லோடிங் உடன் டேட்டா பெறுகிறது
    api.get('/AdminDashboard/system-metrics')
    .then(res => setMetrics(res.data))
    .catch(err => console.error('Initial load failed:', err))
    .finally(() => setInitialLoading(false));

    // 2. 🎯 லேக் தவிர்க்க 3 செகண்டிற்கு (3000ms) ஒருமுறை ஸ்மூத்தாகப் புதுப்பிக்கிறது
    const interval = setInterval(() => {
      fetchMetricsSilent();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400 gap-2">
      <RefreshCw className="w-5 h-5 animate-spin text-indigo-500" />
      <span>அட்மின் சிஸ்டம் கன்சோல் தயார் செய்யப்படுகிறது...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100 space-y-6">
    {/* Header */}
    <div className="flex justify-between items-center border-b border-slate-800 pb-4">
    <div>
    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
    <Server className="text-indigo-400" /> Admin System Console
    </h1>
    <p className="text-xs text-slate-400 mt-1">
    Real-time Live Server, AI Doc Scanner & Analytics Monitoring
    </p>
    </div>

    {/* Live Stream Status Indicator */}
    <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
    <span className="text-xs text-emerald-400 font-medium">Live Stream</span>
    </div>
    </div>

    {/* 📊 Top Metrics Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {/* Total Users */}
    <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl transition-colors hover:border-slate-500">
    <div className="flex justify-between items-center mb-2">
    <span className="text-xs text-slate-400 font-medium">Total Users</span>
    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><Users size={18} /></div>
    </div>
    <h2 className="text-2xl font-bold text-white">
    {metrics?.totalUsers || 0}
    </h2>
    <span className="text-[11px] text-emerald-400 mt-1 block">Active on System</span>
    </div>

    {/* 🤖 NEW: AI Doc Scanner Usage Card */}
    <div className="bg-slate-800/60 border border-indigo-500/40 p-4 rounded-xl transition-colors hover:border-indigo-400 relative overflow-hidden">
    <div className="flex justify-between items-center mb-2">
    <span className="text-xs text-indigo-300 font-medium flex items-center gap-1">
    <Sparkles size={14} className="text-indigo-400" /> AI Scanner Usage
    </span>
    <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg"><FileText size={18} /></div>
    </div>
    <h2 className="text-2xl font-bold text-indigo-300">
    {metrics?.aiMetrics?.totalAiRequests ?? metrics?.totalApiRequests ?? 0}
    </h2>
    <span className="text-[11px] text-indigo-400 mt-1 block">
    {metrics?.aiMetrics?.scannedDocuments ?? 0} Docs Scanned • {metrics?.aiMetrics?.estimatedTokensUsed ?? 0} Tokens
    </span>
    </div>

    {/* Total API Requests */}
    <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl transition-colors hover:border-slate-500">
    <div className="flex justify-between items-center mb-2">
    <span className="text-xs text-slate-400 font-medium">System API Calls</span>
    <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><Activity size={18} /></div>
    </div>
    <h2 className="text-2xl font-bold text-white">
    {metrics?.totalApiRequests || 0}
    </h2>
    <span className="text-[11px] text-slate-400 mt-1 block">Total System Requests</span>
    </div>

    {/* Server Memory Usage */}
    <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl transition-colors hover:border-slate-500">
    <div className="flex justify-between items-center mb-2">
    <span className="text-xs text-slate-400 font-medium">Server RAM Usage</span>
    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg"><Cpu size={18} /></div>
    </div>
    <h2 className="text-2xl font-bold text-amber-300">
    {metrics?.serverMetrics?.memoryUsage || '0 MB'}
    </h2>
    <span className="text-[11px] text-slate-400 mt-1 block">ASP.NET Core Memory</span>
    </div>
    </div>

    {/* 🖥️ Server & AI Engine Status Section */}
    <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-6">
    <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">
    <Server size={18} className="text-indigo-400" /> Server Management & AI Engine Status
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs font-mono">
    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
    <span className="text-slate-500 block">Server Health</span>
    <span className="text-emerald-400 text-sm font-bold block mt-1">
    ● {metrics?.serverMetrics?.status || 'Active'}
    </span>
    </div>

    <div className="bg-slate-900 p-4 rounded-lg border border-indigo-900/50">
    <span className="text-indigo-400 block flex items-center gap-1">
    <Sparkles size={12} /> AI Engine Status
    </span>
    <span className="text-indigo-300 text-sm font-bold block mt-1">
    ● {metrics?.aiMetrics?.aiStatus || 'Operational'}
    </span>
    </div>

    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
    <span className="text-slate-500 block">Server Uptime</span>
    <span className="text-slate-200 text-sm font-bold block mt-1 flex items-center gap-1">
    <Clock size={14} className="text-slate-400" /> {metrics?.serverMetrics?.uptime || 'N/A'}
    </span>
    </div>

    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
    <span className="text-slate-500 block">Environment</span>
    <span className="text-indigo-300 text-sm font-bold block mt-1">
    {metrics?.serverMetrics?.environment || '.NET 6.0 API'}
    </span>
    </div>
    </div>
    </div>
    </div>
  );
};

export default AdminDashboard;
