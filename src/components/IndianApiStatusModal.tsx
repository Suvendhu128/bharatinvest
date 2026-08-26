import React from 'react';
import { ShieldCheck, CheckCircle2, Globe, Key, Clock, Database, X, Sparkles, ExternalLink } from 'lucide-react';

interface IndianApiStatusModalProps {
  onClose: () => void;
  apiStatus: {
    configuredKey: string;
    service: string;
    endpointsAvailable: string[];
    authHeader: string;
    isReachable: boolean;
    marketStatus: string;
    timeIST: string;
  } | null;
}

export const IndianApiStatusModal: React.FC<IndianApiStatusModalProps> = ({ onClose, apiStatus }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-white space-y-5">
        
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">IndianAPI.in Engine Status</h3>
              <p className="text-xs text-slate-400">Live Indian Stock Market & Mutual Fund Gateway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs">
          
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400">API Key Mask:</span>
            </div>
            <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {apiStatus?.configuredKey || 'sk-live-axk...Fki'}
            </span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400">Auth Header:</span>
            </div>
            <span className="font-mono text-slate-200">x-api-key (Server Secured)</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">NSE/BSE Market Status:</span>
            </div>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {apiStatus?.marketStatus || 'Active (09:15 - 15:30 IST)'}
            </span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5 block">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              Integrated IndianAPI Endpoints:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>/stock (Quotes)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>/stock/indices</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>/stock/financials</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>/stock/historical</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>/mutual-funds</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>/news</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-slate-300 text-[11px] leading-relaxed">
            <span className="font-bold text-emerald-300 block mb-0.5">Architecture Flow:</span>
            IndianAPI → Live NSE/BSE Market Feeds → Compounding Engine → Gemini 3.7 AI Explanation.
          </div>

        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
        >
          Done
        </button>
      </div>
    </div>
  );
};
