import React, { useState, useMemo } from 'react';
import { MutualFundItem } from '../types';
import {
  Search,
  PieChart,
  ShieldCheck,
  Star,
  Calculator,
  ChevronRight,
  TrendingUp,
  Percent,
  SlidersHorizontal,
  Layers,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import { formatINR, formatNumberIN, formatPercent, calculateSIPProjections } from '../lib/formatters';

interface MutualFundExplorerProps {
  funds: MutualFundItem[];
  onOpenSipPlannerWithFund?: (fund: MutualFundItem) => void;
}

export const MutualFundExplorer: React.FC<MutualFundExplorerProps> = ({
  funds,
  onOpenSipPlannerWithFund,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [minCrisilRank, setMinCrisilRank] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'cagr3Y' | 'cagr5Y' | 'cagr1Y' | 'aum' | 'expenseRatio'>('cagr3Y');
  const [selectedFundForCalc, setSelectedFundForCalc] = useState<MutualFundItem | null>(null);
  const [quickSipAmount, setQuickSipAmount] = useState<number>(5000);
  const [quickSipYears, setQuickSipYears] = useState<number>(5);

  const categories = [
    'All',
    'Flexi Cap',
    'Large Cap',
    'Mid Cap',
    'Small Cap',
    'ELSS / Tax Saver',
    'Hybrid / Multi-Asset',
    'Debt & Liquid',
    'Index / ETF'
  ];

  const filteredFunds = useMemo(() => {
    let result = [...funds];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.amc.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter((f) => f.category === selectedCategory);
    }

    if (minCrisilRank !== 'All') {
      const rank = parseInt(minCrisilRank, 10);
      result = result.filter((f) => f.crisilRank >= rank);
    }

    result.sort((a, b) => {
      if (sortBy === 'expenseRatio') {
        return a.expenseRatio - b.expenseRatio; // lower expense ratio is better
      }
      return (b[sortBy] ?? 0) - (a[sortBy] ?? 0);
    });

    return result;
  }, [funds, searchQuery, selectedCategory, minCrisilRank, sortBy]);

  // Quick SIP calculation result for modal
  const sipResult = useMemo(() => {
    if (!selectedFundForCalc) return null;
    const rate = selectedFundForCalc.cagr5Y || selectedFundForCalc.cagr3Y || 12;
    return calculateSIPProjections(quickSipAmount, rate, quickSipYears, 0);
  }, [selectedFundForCalc, quickSipAmount, quickSipYears]);

  return (
    <div className="space-y-6">
      
      {/* Category Pills Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-4">
        
        {/* Search and Top Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-fund-search"
              type="text"
              placeholder="Search Mutual Funds (e.g. Parag Parikh, Quant)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Sort:</span>
              <select
                id="select-fund-sort"
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="cagr3Y">3Y CAGR (Highest)</option>
                <option value="cagr5Y">5Y CAGR (Highest)</option>
                <option value="cagr1Y">1Y Return</option>
                <option value="aum">AUM (Largest)</option>
                <option value="expenseRatio">Expense Ratio (Lowest TER)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Rating:</span>
              <select
                id="select-fund-crisil"
                value={minCrisilRank}
                onChange={(e) => setMinCrisilRank(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none"
              >
                <option value="All">All Ratings</option>
                <option value="5">5 Star Only</option>
                <option value="4">4+ Stars</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-slate-800/60">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`cat-btn-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Funds Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredFunds.map((fund) => (
          <div
            key={fund.id}
            id={`fund-card-${fund.id}`}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition flex flex-col justify-between shadow-lg"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                      {fund.category}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      AMC: <strong className="text-slate-300">{fund.amc}</strong>
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white mt-1.5 line-clamp-1">
                    {fund.name}
                  </h3>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-0.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 shrink-0">
                  {Array.from({ length: fund.crisilRank }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                {fund.description}
              </p>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">3Y CAGR</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {formatPercent(fund.cagr3Y, false)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">5Y CAGR</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {formatPercent(fund.cagr5Y, false)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Expense Ratio (TER)</span>
                  <span className="font-mono font-semibold text-slate-200 text-sm">
                    {fund.expenseRatio}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">AUM (Fund Size)</span>
                  <span className="font-mono font-semibold text-slate-200 text-sm">
                    ₹{formatNumberIN(fund.aum)} Cr
                  </span>
                </div>
              </div>

              {/* Top Holdings Bar */}
              <div className="mt-4">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Top Portfolio Holdings:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {fund.topHoldings.map((h, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md border border-slate-700/60 font-mono"
                    >
                      {h.company} ({h.percentage}%)
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Card Footer Actions */}
            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap text-xs">
              <span className="text-[11px] text-slate-400">
                Min. SIP: <strong className="text-white font-mono font-semibold">₹{fund.minSipAmount}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedFundForCalc(fund)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition"
                >
                  <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SIP Simulator</span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Quick SIP Calculator Modal */}
      {selectedFundForCalc && sipResult && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-5 sm:p-6 text-white space-y-4">
            
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                  SIP Wealth Projector
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedFundForCalc.name}</h3>
                <span className="text-xs text-slate-400">Historical Return Used: {selectedFundForCalc.cagr5Y || selectedFundForCalc.cagr3Y}% CAGR</span>
              </div>
              <button
                onClick={() => setSelectedFundForCalc(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Monthly SIP Amount:</span>
                  <span className="font-bold font-mono text-emerald-400">{formatINR(quickSipAmount)}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="100000"
                  step="500"
                  value={quickSipAmount}
                  onChange={(e) => setQuickSipAmount(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Investment Duration:</span>
                  <span className="font-bold font-mono text-emerald-400">{quickSipYears} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  step="1"
                  value={quickSipYears}
                  onChange={(e) => setQuickSipYears(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Total Invested</span>
                <span className="font-mono font-bold text-white text-base">
                  {formatINR(sipResult.totalInvested)}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-emerald-900/40">
                <span className="text-[11px] text-emerald-400 block">Estimated Future Value</span>
                <span className="font-mono font-bold text-emerald-400 text-base">
                  {formatINR(sipResult.futureValue)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-xs text-slate-300">
              <p>
                Estimated Wealth Gain: <strong className="text-emerald-300 font-mono">+{formatINR(sipResult.wealthGained)}</strong> over {quickSipYears} years.
              </p>
            </div>

            <button
              onClick={() => setSelectedFundForCalc(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
