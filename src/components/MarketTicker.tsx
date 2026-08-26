import React from 'react';
import { MarketIndex } from '../types';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { formatNumberIN, formatPercent } from '../lib/formatters';

interface MarketTickerProps {
  indices: MarketIndex[];
  onSelectIndex?: (index: MarketIndex) => void;
}

export const MarketTicker: React.FC<MarketTickerProps> = ({ indices }) => {
  return (
    <div className="bg-slate-950 border-b border-slate-800/80 py-2 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
        
        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-200 uppercase tracking-wider">Indian Markets</span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3 text-slate-500" />
            IST 09:15 - 15:30
          </span>
        </div>

        {/* Indices Ticker Items */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-0.5">
          {indices.map((idx) => {
            const isPositive = idx.change >= 0;
            return (
              <div
                key={idx.symbol}
                id={`ticker-index-${idx.symbol.replace(/\s+/g, '-').toLowerCase()}`}
                className="flex items-center gap-2 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/60 hover:border-slate-700 px-3 py-1 rounded-lg transition shrink-0 cursor-default"
              >
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-200 tracking-tight">
                    {idx.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-semibold text-white">
                      {formatNumberIN(idx.value)}
                    </span>
                    <span
                      className={`flex items-center text-[10px] font-semibold font-mono ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-2.5 h-2.5 mr-0.5 inline" />
                      ) : (
                        <TrendingDown className="w-2.5 h-2.5 mr-0.5 inline" />
                      )}
                      {formatPercent(idx.changePercent)}
                    </span>
                  </div>
                </div>

                {/* Mini SVG Sparkline */}
                {idx.sparkline && idx.sparkline.length > 1 && (
                  <div className="w-12 h-6 pl-1 flex items-center">
                    <svg viewBox="0 0 50 20" className="w-full h-full overflow-visible">
                      <polyline
                        fill="none"
                        stroke={isPositive ? '#10b981' : '#f43f5e'}
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={idx.sparkline
                          .map((val, i) => {
                            const min = Math.min(...idx.sparkline);
                            const max = Math.max(...idx.sparkline);
                            const range = max - min || 1;
                            const x = (i / (idx.sparkline.length - 1)) * 48 + 1;
                            const y = 18 - ((val - min) / range) * 16;
                            return `${x},${y}`;
                          })
                          .join(' ')}
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
