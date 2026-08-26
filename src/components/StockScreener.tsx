import React, { useState, useMemo } from 'react';
import { StockItem } from '../types';
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowUpDown,
  Check,
  Zap,
  SlidersHorizontal,
  ChevronRight,
  BarChart3,
  Layers
} from 'lucide-react';
import { formatINR, formatNumberIN, formatPercent } from '../lib/formatters';

interface StockScreenerProps {
  stocks: StockItem[];
  onSelectStock: (stock: StockItem) => void;
}

export const StockScreener: React.FC<StockScreenerProps> = ({ stocks, onSelectStock }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCap, setSelectedCap] = useState<string>('All');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [activeFilterPreset, setActiveFilterPreset] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'marketCap' | 'changePercent' | 'peRatio' | 'roe' | 'price'>('marketCap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Distinct sectors list
  const sectors = useMemo(() => {
    const set = new Set<string>();
    stocks.forEach((s) => set.add(s.sector));
    return ['All', ...Array.from(set)];
  }, [stocks]);

  // Top gainers & losers for top cards
  const topGainers = useMemo(() => {
    return [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
  }, [stocks]);

  const topLosers = useMemo(() => {
    return [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 3);
  }, [stocks]);

  // Filtered and sorted stocks
  const filteredStocks = useMemo(() => {
    let result = [...stocks];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.symbol.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q)
      );
    }

    // Market cap
    if (selectedCap !== 'All') {
      result = result.filter((s) => s.marketCapCategory === selectedCap);
    }

    // Sector
    if (selectedSector !== 'All') {
      result = result.filter((s) => s.sector === selectedSector);
    }

    // Filter presets
    if (activeFilterPreset === 'high-roe') {
      result = result.filter((s) => s.roe >= 20);
    } else if (activeFilterPreset === 'low-pe') {
      result = result.filter((s) => s.peRatio <= 30 && s.peRatio > 0);
    } else if (activeFilterPreset === 'bullish-trend') {
      result = result.filter((s) => s.price >= s.dma200);
    } else if (activeFilterPreset === 'oversold') {
      result = result.filter((s) => s.rsi < 45);
    }

    // Sorting
    result.sort((a, b) => {
      let valA = a[sortBy] ?? 0;
      let valB = b[sortBy] ?? 0;
      if (typeof valA === 'string') valA = Number(valA) || 0;
      if (typeof valB === 'string') valB = Number(valB) || 0;

      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1;
      }
      return valA < valB ? 1 : -1;
    });

    return result;
  }, [stocks, searchQuery, selectedCap, selectedSector, activeFilterPreset, sortBy, sortOrder]);

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Gainers & Losers Bento Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Top Gainers */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-900/40 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              Top Nifty & BSE Gainers
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Live Bullish
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {topGainers.map((s) => (
              <button
                key={s.symbol}
                onClick={() => onSelectStock(s)}
                className="text-left bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 p-2.5 rounded-xl transition group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition">
                    {s.symbol}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 font-mono">
                    {formatPercent(s.changePercent)}
                  </span>
                </div>
                <div className="text-xs font-semibold font-mono text-white mt-1">
                  {formatINR(s.price)}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{s.sector}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Top Losers / Value Watch */}
        <div className="bg-gradient-to-br from-rose-950/30 via-slate-900 to-slate-950 border border-rose-900/30 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4" />
              Pullback & Dip Opportunities
            </span>
            <span className="text-[10px] bg-rose-500/10 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/20">
              Correction Watch
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {topLosers.map((s) => (
              <button
                key={s.symbol}
                onClick={() => onSelectStock(s)}
                className="text-left bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 p-2.5 rounded-xl transition group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-200 group-hover:text-rose-400 transition">
                    {s.symbol}
                  </span>
                  <span className="text-[10px] font-bold text-rose-400 font-mono">
                    {formatPercent(s.changePercent)}
                  </span>
                </div>
                <div className="text-xs font-semibold font-mono text-white mt-1">
                  {formatINR(s.price)}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{s.sector}</div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Filter & Screener Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-4">
        
        {/* Top Row: Search & Market Cap Chips */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Search Field */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-stock-search"
              type="text"
              placeholder="Search by Symbol (e.g. RELIANCE, TCS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Market Cap Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
            {['All', 'Large Cap', 'Mid Cap', 'Small Cap'].map((cap) => (
              <button
                key={cap}
                id={`cap-filter-${cap.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCap(cap)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                  selectedCap === cap
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {cap}
              </button>
            ))}
          </div>

        </div>

        {/* Second Row: Sector Dropdown & Preset Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          
          {/* Sector Selector */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400">Sector:</span>
            <select
              id="select-stock-sector"
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              {sectors.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Screen Preset Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'All', label: 'All Stocks' },
              { id: 'high-roe', label: '⭐ High ROE (>20%)' },
              { id: 'low-pe', label: '💎 Value P/E (<30x)' },
              { id: 'bullish-trend', label: '📈 Above 200 DMA' },
              { id: 'oversold', label: '🎯 RSI Dip (<45)' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveFilterPreset(p.id)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition ${
                  activeFilterPreset === p.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Table vs Card Toggle */}
          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 ml-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs transition ${
                viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table View"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded text-xs transition ${
                viewMode === 'cards' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid Cards View"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Main Stock List (Table or Grid) */}
      {viewMode === 'table' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Company & Symbol</th>
                  <th
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
                    onClick={() => toggleSort('price')}
                  >
                    <div className="flex items-center gap-1">
                      Price (LTP)
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
                    onClick={() => toggleSort('changePercent')}
                  >
                    <div className="flex items-center gap-1">
                      24h Change
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
                    onClick={() => toggleSort('marketCap')}
                  >
                    <div className="flex items-center gap-1">
                      Market Cap (Cr)
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
                    onClick={() => toggleSort('peRatio')}
                  >
                    <div className="flex items-center gap-1">
                      P/E
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
                    onClick={() => toggleSort('roe')}
                  >
                    <div className="flex items-center gap-1">
                      ROE %
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold">RSI (14)</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStocks.map((stock) => {
                  const isPositive = stock.change >= 0;
                  return (
                    <tr
                      key={stock.symbol}
                      id={`stock-row-${stock.symbol.toLowerCase()}`}
                      onClick={() => onSelectStock(stock)}
                      className="hover:bg-slate-800/50 transition cursor-pointer group"
                    >
                      {/* Name & Sector */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white font-mono text-xs group-hover:text-emerald-400 transition">
                                {stock.symbol}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                                {stock.exchange}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[180px] sm:max-w-[240px]">
                              {stock.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white text-xs">
                        {formatINR(stock.price)}
                      </td>

                      {/* Change */}
                      <td className="py-3.5 px-4 font-mono">
                        <span
                          className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded ${
                            isPositive
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {formatPercent(stock.changePercent)}
                        </span>
                      </td>

                      {/* Market Cap */}
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        ₹{formatNumberIN(stock.marketCap)} Cr
                        <span className="block text-[10px] text-slate-500 font-sans">
                          {stock.marketCapCategory}
                        </span>
                      </td>

                      {/* PE */}
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {stock.peRatio}x
                      </td>

                      {/* ROE */}
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {stock.roe}%
                      </td>

                      {/* RSI */}
                      <td className="py-3.5 px-4 font-mono">
                        <span
                          className={`text-xs font-semibold ${
                            stock.rsi > 70
                              ? 'text-rose-400'
                              : stock.rsi < 35
                              ? 'text-emerald-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {stock.rsi}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          id={`btn-analyze-${stock.symbol.toLowerCase()}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStock(stock);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/20 transition"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>AI Thesis</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Bento Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStocks.map((stock) => {
            const isPositive = stock.change >= 0;
            return (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock)}
                className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl transition cursor-pointer flex flex-col justify-between group shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm font-mono text-white group-hover:text-emerald-400 transition">
                          {stock.symbol}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded">
                          {stock.sector}
                        </span>
                      </div>
                      <h4 className="text-xs text-slate-400 mt-0.5 line-clamp-1">{stock.name}</h4>
                    </div>
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                        isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {formatPercent(stock.changePercent)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-lg font-bold font-mono text-white">
                      {formatINR(stock.price)}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      MCap: ₹{formatNumberIN(stock.marketCap)} Cr
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">P/E</span>
                      <span className="font-mono text-slate-300 font-semibold">{stock.peRatio}x</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">ROE</span>
                      <span className="font-mono text-slate-300 font-semibold">{stock.roe}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">RSI</span>
                      <span className="font-mono text-slate-300 font-semibold">{stock.rsi}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">52W: {formatINR(stock.low52)} - {formatINR(stock.high52)}</span>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition">
                    View AI Analysis
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredStocks.length === 0 && (
        <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400">
          <p className="text-sm">No stocks found matching your search or filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCap('All');
              setSelectedSector('All');
              setActiveFilterPreset('All');
            }}
            className="mt-3 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
          >
            Reset Filters
          </button>
        </div>
      )}

    </div>
  );
};
