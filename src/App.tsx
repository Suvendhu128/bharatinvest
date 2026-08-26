/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MarketIndex, StockItem, MutualFundItem, NewsItem } from './types';
import { INITIAL_INDICES, STOCKS_DATA, MUTUAL_FUNDS_DATA, MARKET_NEWS } from './data/marketData';
import { Navbar } from './components/Navbar';
import { MarketTicker } from './components/MarketTicker';
import { StockScreener } from './components/StockScreener';
import { MutualFundExplorer } from './components/MutualFundExplorer';
import { GoalSIPEngine } from './components/GoalSIPEngine';
import { PortfolioDoctor } from './components/PortfolioDoctor';
import { AICopilot } from './components/AICopilot';
import { MarketNews } from './components/MarketNews';
import { StockDetailModal } from './components/StockDetailModal';
import { IndianApiStatusModal } from './components/IndianApiStatusModal';
import { Sparkles, RefreshCw, Layers, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'screener' | 'funds' | 'goals' | 'doctor' | 'copilot' | 'news'>('screener');
  const [indices, setIndices] = useState<MarketIndex[]>(INITIAL_INDICES);
  const [stocks, setStocks] = useState<StockItem[]>(STOCKS_DATA);
  const [funds, setFunds] = useState<MutualFundItem[]>(MUTUAL_FUNDS_DATA);
  const [news, setNews] = useState<NewsItem[]>(MARKET_NEWS);
  
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [showApiStatusModal, setShowApiStatusModal] = useState(false);
  const [apiStatus, setApiStatus] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  const safeFetchJson = async (url: string) => {
    try {
      const res = await fetch(url);
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        return await res.json();
      }
      return null;
    } catch {
      return null;
    }
  };

  const fetchMarketData = async () => {
    setRefreshing(true);
    try {
      // Fetch indices
      const idxData = await safeFetchJson('/api/market/indices');
      if (idxData?.indices) setIndices(idxData.indices);

      // Fetch stocks
      const stkData = await safeFetchJson('/api/market/stocks');
      if (stkData?.stocks) setStocks(stkData.stocks);

      // Fetch mutual funds
      const mfData = await safeFetchJson('/api/market/mutual-funds');
      if (mfData?.funds) setFunds(mfData.funds);

      // Fetch news
      const newsData = await safeFetchJson('/api/market/news');
      if (newsData?.news) setNews(newsData.news);

      // Fetch API status
      const statusData = await safeFetchJson('/api/indian-api/status');
      if (statusData) {
        setApiStatus(statusData);
      }

      setLastUpdatedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Error updating market feeds:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white font-sans">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenApiStatus={() => setShowApiStatusModal(true)}
      />

      {/* Real-time Indices Ticker Banner */}
      <MarketTicker
        indices={indices}
        onSelectIndex={(idx) => {
          // If user clicks on an index, go to stock screener
          setActiveTab('screener');
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Sub-header Bar with Market Status & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 px-4 py-3 rounded-2xl">
          <div className="flex items-center gap-2.5 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Indian Stock Market (NSE / BSE)
            </span>
            <span>•</span>
            <span className="font-mono text-slate-400">Trading Hours: 09:15 - 15:30 IST</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline font-mono text-[11px] text-slate-500">Last Synced: {lastUpdatedTime}</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={fetchMarketData}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition disabled:opacity-50"
              title="Refresh live feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Sync Data'}</span>
            </button>
          </div>
        </div>

        {/* View Switcher based on Active Tab */}
        {activeTab === 'screener' && (
          <StockScreener
            stocks={stocks}
            onSelectStock={(stk) => setSelectedStock(stk)}
          />
        )}

        {activeTab === 'funds' && (
          <MutualFundExplorer
            funds={funds}
            onOpenSipPlannerWithFund={() => {
              setActiveTab('goals');
            }}
          />
        )}

        {activeTab === 'goals' && (
          <GoalSIPEngine />
        )}

        {activeTab === 'doctor' && (
          <PortfolioDoctor />
        )}

        {activeTab === 'copilot' && (
          <AICopilot />
        )}

        {activeTab === 'news' && (
          <MarketNews news={news} />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300 font-mono">BharatInvest</span>
            <span>—</span>
            <span>Indian Stock Market & Mutual Fund Wealth Intelligence</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>IndianAPI.in Engine</span>
            <span>•</span>
            <span>Gemini 3.7 Flash AI</span>
            <span>•</span>
            <span>Union Budget FY 2025-26 Compliant</span>
          </div>
        </div>
      </footer>

      {/* Stock Deep-Dive & AI Thesis Modal */}
      {selectedStock && (
        <StockDetailModal
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
        />
      )}

      {/* IndianAPI Configuration & Health Status Modal */}
      {showApiStatusModal && (
        <IndianApiStatusModal
          apiStatus={apiStatus}
          onClose={() => setShowApiStatusModal(false)}
        />
      )}

    </div>
  );
}
