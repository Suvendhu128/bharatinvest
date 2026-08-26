import React, { useState } from 'react';
import { NewsItem } from '../types';
import {
  Newspaper,
  TrendingUp,
  Clock,
  ExternalLink,
  ShieldCheck,
  Zap,
  Filter
} from 'lucide-react';

interface MarketNewsProps {
  news: NewsItem[];
}

export const MarketNews: React.FC<MarketNewsProps> = ({ news }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Equities', 'Mutual Funds', 'Policy & RBI', 'Economy', 'Earnings'];

  const filteredNews = selectedCategory === 'All'
    ? news
    : news.filter((n) => n.category === selectedCategory);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-emerald-400" />
            Indian Financial Markets Pulse & Corporate News
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Curated coverage of NSE/BSE corporate announcements, AMFI mutual fund data, and RBI macro developments.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
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

      {/* News Cards Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNews.map((item) => {
          const isPositive = item.impact === 'Positive';
          const isNegative = item.impact === 'Negative';
          return (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition flex flex-col justify-between shadow-md group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isPositive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isNegative
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.impact} Market Impact
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-400 transition leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>Source: <strong className="text-slate-300 font-medium">{item.source}</strong></span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  Full Story
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
