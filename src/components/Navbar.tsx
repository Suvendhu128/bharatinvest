import React from 'react';
import {
  TrendingUp,
  PieChart,
  Target,
  Sparkles,
  Newspaper,
  ShieldCheck,
  Search,
  Activity,
  Briefcase
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
  onOpenApiStatus: () => void;
  apiStatus: {
    configuredKey: string;
    isReachable: boolean;
    marketStatus: string;
  } | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  onOpenApiStatus,
  apiStatus,
}) => {
  const tabs = [
    { id: 'stocks', label: 'Stocks & Screener', icon: TrendingUp },
    { id: 'funds', label: 'Mutual Funds', icon: PieChart },
    { id: 'goals', label: 'Goal & SIP Planner', icon: Target },
    { id: 'portfolio', label: 'Portfolio Doctor', icon: Briefcase },
    { id: 'copilot', label: 'AI Copilot', icon: Sparkles },
    { id: 'news', label: 'Market News', icon: Newspaper },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-white to-emerald-600 p-[2px] shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-orange-400 via-amber-200 to-emerald-400 bg-clip-text text-transparent">
                  BharatInvest
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  NSE • BSE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none mt-0.5">
                Indian Stock Market & Mutual Fund Intelligence
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.id === 'copilot' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search */}
            <button
              id="btn-global-search"
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition"
              title="Search NSE/BSE stocks & Mutual Funds (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Search Assets</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-slate-900 border border-slate-700 rounded text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* IndianAPI Key & Market Status */}
            <button
              id="btn-indianapi-status"
              onClick={onOpenApiStatus}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
              title="IndianAPI & Market Connection"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] text-slate-300 hidden sm:inline">
                IndianAPI
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>

        </div>

        {/* Mobile Navigation Horizontal Scroll */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1.5 border-t border-slate-800/50 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`mobile-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium transition ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-950/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
