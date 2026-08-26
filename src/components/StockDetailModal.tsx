import React, { useState } from 'react';
import { StockItem, AIAnalysisResponse } from '../types';
import {
  X,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ShieldAlert,
  Target,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  Info,
  Copy,
  Check
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { formatINR, formatNumberIN, formatPercent } from '../lib/formatters';

interface StockDetailModalProps {
  stock: StockItem | null;
  onClose: () => void;
  onSelectForComparison?: (stock: StockItem) => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({ stock, onClose }) => {
  const [activeTimeframe, setActiveTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | '5Y'>('1Y');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!stock) return null;

  const isPositive = stock.change >= 0;

  // Generate chart data based on timeframe
  const generateChartData = () => {
    const base = stock.price;
    const points = activeTimeframe === '1D' ? 8 : activeTimeframe === '1W' ? 7 : activeTimeframe === '1M' ? 15 : activeTimeframe === '1Y' ? 12 : 20;
    const volatility = activeTimeframe === '1D' ? 0.015 : activeTimeframe === '1Y' ? 0.25 : 0.45;
    
    return Array.from({ length: points }).map((_, i) => {
      const progress = i / (points - 1);
      const factor = (progress - 0.5) * volatility + (Math.sin(i * 1.5) * 0.03);
      const price = base * (1 + factor);
      let label = `T-${points - i}`;
      if (activeTimeframe === '1D') label = `${9 + Math.floor(i * 0.8)}:${(i % 2) * 30 || '00'}`;
      if (activeTimeframe === '1Y') label = `Month ${i + 1}`;
      if (activeTimeframe === '5Y') label = `202${i % 6}`;

      return {
        name: label,
        price: Number(price.toFixed(2)),
      };
    });
  };

  const chartData = generateChartData();

  const handleRunAiAnalysis = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/gemini/analyze-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock }),
      });
      const data = await res.json();
      if (res.ok && data.analysis) {
        setAiAnalysis(data.analysis);
      } else {
        setAiError(data.error || 'Failed to complete analysis.');
      }
    } catch (err: any) {
      setAiError(err.message || 'Network error occurred');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyAnalysis = () => {
    if (!aiAnalysis) return;
    const text = `📊 BharatInvest AI Analysis for ${stock.name} (${stock.symbol}):
Verdict: ${aiAnalysis.recommendedAction} (${aiAnalysis.sentiment})
Target Horizon: ${aiAnalysis.targetHorizon}
Summary: ${aiAnalysis.summary}
Valuation: ${aiAnalysis.valuationVerdict}
Key Growth Drivers:
${aiAnalysis.keyDrivers.map(d => `- ${d}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div
        id="stock-detail-modal"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl text-white flex flex-col relative"
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-4 sm:p-6 flex items-start justify-between z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {stock.name}
              </span>
              <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-800 text-emerald-400 rounded border border-slate-700">
                {stock.symbol}
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
                {stock.exchange}
              </span>
              <span className="px-2 py-0.5 text-xs font-medium bg-slate-800 text-slate-300 rounded">
                {stock.sector}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">{stock.description}</p>
          </div>

          <button
            onClick={onClose}
            id="btn-close-stock-modal"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* Price Banner & 52-Week Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Current Market Price (LTP)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                  {formatINR(stock.price)}
                </span>
                <span
                  className={`flex items-center text-sm font-bold font-mono ${
                    isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5 mr-1 inline" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 mr-1 inline" />
                  )}
                  {formatINR(stock.change)} ({formatPercent(stock.changePercent)})
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Volume: {stock.volume} shares</span>
            </div>

            <div className="md:col-span-2 flex flex-col justify-center">
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>52W Low: <strong className="text-slate-200">{formatINR(stock.low52)}</strong></span>
                <span>52W High: <strong className="text-slate-200">{formatINR(stock.high52)}</strong></span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full rounded-full"
                  style={{
                    width: `${Math.min(
                      Math.max(((stock.price - stock.low52) / (stock.high52 - stock.low52 || 1)) * 100, 5),
                      100
                    )}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Bearish Range</span>
                <span>All-Time Zone</span>
              </div>
            </div>
          </div>

          {/* Interactive Chart */}
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                Price Performance Chart
              </span>
              <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                {(['1D', '1W', '1M', '1Y', '5Y'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setActiveTimeframe(tf)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                      activeTimeframe === tf
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    domain={['dataMin - 10', 'dataMax + 10']}
                    tickFormatter={(v) => `₹${v}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(value: any) => [`₹${value}`, 'Price']}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={isPositive ? '#10b981' : '#f43f5e'}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Fundamentals & Technical Indicators Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Key Ratios & Technical Indicators
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Market Cap</span>
                <span className="text-sm font-semibold font-mono text-white">
                  ₹{formatNumberIN(stock.marketCap)} Cr
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">{stock.marketCapCategory}</span>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">P/E Ratio</span>
                <span className="text-sm font-semibold font-mono text-white">{stock.peRatio}x</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">P/B: {stock.pbRatio}x</span>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">ROE & Dividend</span>
                <span className="text-sm font-semibold font-mono text-white">{stock.roe}%</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Yield: {stock.dividendYield}%</span>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">RSI (14)</span>
                <span className="text-sm font-semibold font-mono text-white">{stock.rsi}</span>
                <span className={`text-[10px] block mt-0.5 font-medium ${stock.rsi > 70 ? 'text-rose-400' : stock.rsi < 35 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {stock.rsi > 70 ? 'Overbought' : stock.rsi < 35 ? 'Oversold' : 'Neutral'}
                </span>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">50-DMA</span>
                <span className="text-sm font-semibold font-mono text-white">₹{formatNumberIN(stock.dma50)}</span>
                <span className={`text-[10px] block mt-0.5 ${stock.price >= stock.dma50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stock.price >= stock.dma50 ? 'Above 50-DMA' : 'Below 50-DMA'}
                </span>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">200-DMA (Long Trend)</span>
                <span className="text-sm font-semibold font-mono text-white">₹{formatNumberIN(stock.dma200)}</span>
                <span className={`text-[10px] block mt-0.5 ${stock.price >= stock.dma200 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stock.price >= stock.dma200 ? 'Bullish Trend' : 'Bearish Trend'}
                </span>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">3Y Revenue Growth</span>
                <span className="text-sm font-semibold font-mono text-white">+{stock.financials?.revenueGrowth3Y || 15}%</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">PAT: +{stock.financials?.profitGrowth3Y || 18}%</span>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Promoter / FII / DII</span>
                <span className="text-xs font-semibold font-mono text-slate-200">
                  {stock.financials?.promoterHolding}% / {stock.financials?.fiiHolding}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">DII: {stock.financials?.diiHolding}%</span>
              </div>
            </div>
          </div>

          {/* AI Research Copilot Section */}
          <div className="border-t border-slate-800 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    Gemini AI Equity Research
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-semibold rounded-full">
                      SEBI RA Engine
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Fundamental moat analysis, Indian macroeconomic catalysts, SWOT & valuation rating.
                  </p>
                </div>
              </div>

              {!aiAnalysis && (
                <button
                  id="btn-run-ai-stock-analysis"
                  onClick={handleRunAiAnalysis}
                  disabled={aiLoading}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40 transition disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                  <span>{aiLoading ? 'Analyzing Stock...' : 'Generate AI Thesis'}</span>
                </button>
              )}
            </div>

            {aiLoading && (
              <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-slate-800 space-y-3 animate-pulse">
                <Sparkles className="w-8 h-8 text-emerald-400 mx-auto animate-spin" />
                <p className="text-sm text-slate-300 font-medium">
                  Evaluating {stock.name} against Indian sector multiples, quarterly earnings, and macro tailwinds...
                </p>
                <span className="text-xs text-slate-500">Processing via Gemini 3.7 Flash</span>
              </div>
            )}

            {aiError && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            {aiAnalysis && (
              <div className="space-y-4 bg-slate-950/70 p-5 rounded-2xl border border-emerald-900/30">
                {/* Header Action / Sentiment */}
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Verdict:</span>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                        aiAnalysis.recommendedAction === 'Strong Buy' || aiAnalysis.recommendedAction === 'Accumulate'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : aiAnalysis.recommendedAction === 'Hold'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {aiAnalysis.recommendedAction}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                      Sentiment: {aiAnalysis.sentiment}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      Horizon: <strong className="text-slate-200">{aiAnalysis.targetHorizon}</strong>
                    </span>
                    <button
                      onClick={handleCopyAnalysis}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs flex items-center gap-1 transition"
                      title="Copy AI Summary"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Summary */}
                <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3.5 rounded-xl border border-slate-800">
                  <p>{aiAnalysis.summary}</p>
                </div>

                {/* Growth Drivers & Risks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-xl">
                    <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Structural Growth Drivers & Moats
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {aiAnalysis.keyDrivers.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-rose-950/20 border border-rose-900/30 p-4 rounded-xl">
                    <h5 className="text-xs font-bold text-rose-400 flex items-center gap-1.5 mb-2.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Key Risks & Headwinds
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {aiAnalysis.risksAndHeadwinds.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* SWOT Matrix */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    SWOT Analysis
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
                    <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                      <span className="font-bold text-emerald-400 block mb-1">Strengths</span>
                      <ul className="space-y-1 text-slate-300">
                        {aiAnalysis.swot?.strengths.map((s, i) => (
                          <li key={i}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                      <span className="font-bold text-amber-400 block mb-1">Weaknesses</span>
                      <ul className="space-y-1 text-slate-300">
                        {aiAnalysis.swot?.weaknesses.map((w, i) => (
                          <li key={i}>• {w}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                      <span className="font-bold text-blue-400 block mb-1">Opportunities</span>
                      <ul className="space-y-1 text-slate-300">
                        {aiAnalysis.swot?.opportunities.map((o, i) => (
                          <li key={i}>• {o}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                      <span className="font-bold text-rose-400 block mb-1">Threats</span>
                      <ul className="space-y-1 text-slate-300">
                        {aiAnalysis.swot?.threats.map((t, i) => (
                          <li key={i}>• {t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Valuation & Suitability */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Valuation Verdict:</span>
                    <span className="text-slate-200 font-medium">{aiAnalysis.valuationVerdict}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Investor Suitability:</span>
                    <span className="text-slate-200 font-medium">{aiAnalysis.suitability}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-900/90 border-t border-slate-800 p-4 px-6 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            Market data powered by IndianAPI.in & NSE/BSE feeds.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
