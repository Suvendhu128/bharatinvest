import React, { useState, useMemo } from 'react';
import { PortfolioAsset } from '../types';
import {
  Briefcase,
  Sparkles,
  Plus,
  Trash2,
  PieChart as PieIcon,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Award,
  RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatINR, formatNumberIN, formatPercent } from '../lib/formatters';

export const PortfolioDoctor: React.FC = () => {
  const [assets, setAssets] = useState<PortfolioAsset[]>([
    {
      id: 'p-1',
      symbol: 'RELIANCE',
      name: 'Reliance Industries Ltd',
      type: 'Stock',
      category: 'Energy & Retail',
      investedValue: 180000,
      currentValue: 225000,
    },
    {
      id: 'p-2',
      symbol: 'HDFCBANK',
      name: 'HDFC Bank Ltd',
      type: 'Stock',
      category: 'Banking',
      investedValue: 150000,
      currentValue: 168000,
    },
    {
      id: 'p-3',
      symbol: 'PPFC',
      name: 'Parag Parikh Flexi Cap Fund',
      type: 'Mutual Fund',
      category: 'Flexi Cap MF',
      investedValue: 300000,
      currentValue: 420000,
    },
    {
      id: 'p-4',
      symbol: 'QUANT-SC',
      name: 'Quant Small Cap Fund',
      type: 'Mutual Fund',
      category: 'Small Cap MF',
      investedValue: 120000,
      currentValue: 185000,
    },
    {
      id: 'p-5',
      symbol: 'GOLDBEES',
      name: 'Nippon India Gold ETF / SGB',
      type: 'Gold',
      category: 'Commodity',
      investedValue: 80000,
      currentValue: 110000,
    },
    {
      id: 'p-6',
      symbol: 'SBI-LIQUID',
      name: 'SBI Liquid Fund / Emergency FD',
      type: 'Fixed Deposit',
      category: 'Debt & Cash',
      investedValue: 150000,
      currentValue: 162000,
    },
  ]);

  // Form State for Adding New Holding
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'Stock' | 'Mutual Fund' | 'Gold' | 'Fixed Deposit'>('Stock');
  const [newInvested, setNewInvested] = useState(50000);
  const [newCurrent, setNewCurrent] = useState(55000);

  // AI Audit State
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<any | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Portfolio Totals
  const totalInvested = useMemo(() => assets.reduce((sum, a) => sum + a.investedValue, 0), [assets]);
  const totalCurrent = useMemo(() => assets.reduce((sum, a) => sum + a.currentValue, 0), [assets]);
  const totalGain = totalCurrent - totalInvested;
  const gainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  // Pie Data by Type
  const allocationByType = useMemo(() => {
    const map = new Map<string, number>();
    assets.forEach((a) => {
      map.set(a.type, (map.get(a.type) || 0) + a.currentValue);
    });
    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
      percent: totalCurrent > 0 ? ((value / totalCurrent) * 100).toFixed(1) : '0',
    }));
  }, [assets, totalCurrent]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  const handleAddAsset = () => {
    if (!newName.trim()) return;
    const item: PortfolioAsset = {
      id: `asset-${Date.now()}`,
      symbol: newSymbol.trim().toUpperCase() || 'CUSTOM',
      name: newName.trim(),
      type: newType,
      category: newType,
      investedValue: Number(newInvested) || 0,
      currentValue: Number(newCurrent) || 0,
    };
    setAssets((prev) => [...prev, item]);
    setShowAddModal(false);
    setNewSymbol('');
    setNewName('');
  };

  const handleRemoveAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const handleRunAudit = async () => {
    setAuditLoading(true);
    setAuditError(null);
    try {
      const res = await fetch('/api/gemini/portfolio-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assets }),
      });
      const data = await res.json();
      if (res.ok && data.audit) {
        setAuditResult(data.audit);
      } else {
        setAuditError(data.error || 'Failed to complete audit');
      }
    } catch (err: any) {
      setAuditError(err.message || 'Network error');
    } finally {
      setAuditLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Portfolio Overview Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 block mb-1">Current Portfolio Value</span>
          <div className="text-2xl font-bold font-mono text-white">{formatINR(totalCurrent)}</div>
          <span className="text-[11px] text-slate-500">{assets.length} Active Holdings</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs text-slate-400 block mb-1">Total Capital Invested</span>
          <div className="text-2xl font-bold font-mono text-slate-200">{formatINR(totalInvested)}</div>
          <span className="text-[11px] text-slate-500">Principal Base</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-900/40 p-5 rounded-2xl">
          <span className="text-xs text-emerald-400 block mb-1 font-semibold">Total Absolute Gains</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            +{formatINR(totalGain)}
          </div>
          <span className="text-[11px] font-mono text-emerald-300 font-semibold">
            {formatPercent(gainPercent)} All-time ROI
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-xs text-slate-400 block">AI Health Diagnostic</span>
          <button
            id="btn-run-portfolio-doctor"
            onClick={handleRunAudit}
            disabled={auditLoading}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${auditLoading ? 'animate-spin' : ''}`} />
            <span>{auditLoading ? 'Auditing...' : 'Run AI Health Audit'}</span>
          </button>
        </div>

      </div>

      {/* Main Grid: Holdings Table & Asset Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Holdings Table (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                Holdings & Allocation
              </h3>
              <p className="text-[11px] text-slate-400">Manage your Indian stocks, funds, gold, and debt</p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Holding</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Instrument</th>
                  <th className="py-2.5 px-3 font-semibold">Type</th>
                  <th className="py-2.5 px-3 font-semibold">Invested</th>
                  <th className="py-2.5 px-3 font-semibold">Current Value</th>
                  <th className="py-2.5 px-3 font-semibold">Gain / Loss</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {assets.map((asset) => {
                  const gain = asset.currentValue - asset.investedValue;
                  const pct = asset.investedValue > 0 ? (gain / asset.investedValue) * 100 : 0;
                  const isPos = gain >= 0;
                  return (
                    <tr key={asset.id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-white font-mono">{asset.symbol}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                          {asset.name}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {asset.type}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-300">
                        {formatINR(asset.investedValue)}
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-white">
                        {formatINR(asset.currentValue)}
                      </td>

                      <td className="py-3 px-3 font-mono">
                        <span className={`text-xs font-semibold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPos ? '+' : ''}{formatINR(gain)} ({formatPercent(pct)})
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleRemoveAsset(asset.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition"
                          title="Delete holding"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Allocation Pie (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              Asset Class Mix
            </h4>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationByType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={3}
                  >
                    {allocationByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    formatter={(value: any) => [formatINR(Number(value)), 'Value']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
            {allocationByType.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span>{item.name}</span>
                </div>
                <span className="font-mono font-semibold text-white">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* AI Doctor Diagnostic Output */}
      {auditLoading && (
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3 animate-pulse">
          <Sparkles className="w-8 h-8 text-emerald-400 mx-auto animate-spin" />
          <p className="text-sm font-semibold text-slate-200">
            Running stress testing, overlap diagnostics, and SEBI-aligned risk audits...
          </p>
          <span className="text-xs text-slate-500">Gemini 3.7 Flash Portfolio Doctor</span>
        </div>
      )}

      {auditError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{auditError}</span>
        </div>
      )}

      {auditResult && (
        <div className="bg-slate-900 border border-emerald-900/40 p-6 rounded-2xl shadow-2xl space-y-6 text-white">
          
          {/* Header Score & Risk Grade */}
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold font-mono text-emerald-400">
                  {auditResult.healthScore}
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-400">/ 100</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Portfolio Health Score
                </span>
                <h3 className="text-lg font-bold text-white">
                  Risk Profile: <span className="text-emerald-400">{auditResult.riskLevel}</span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400">Tax Efficiency:</span>
              <strong className="text-slate-200">{auditResult.taxEfficiencyScore}</strong>
            </div>
          </div>

          {/* Diagnostic Summary */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-white block mb-1">Diagnostic Summary:</span>
            <p>{auditResult.summary}</p>
          </div>

          {/* Overlap & Vulnerabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-xl">
              <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Portfolio Strengths
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {auditResult.strengths?.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-rose-950/20 border border-rose-900/30 p-4 rounded-xl">
              <h5 className="text-xs font-bold text-rose-400 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                Overlap & Concentration Vulnerabilities
              </h5>
              <p className="text-[11px] text-rose-300/90 mb-2 font-medium">
                {auditResult.overlapWarning}
              </p>
              <ul className="space-y-1 text-xs text-slate-300">
                {auditResult.vulnerabilities?.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Rebalancing Steps */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Actionable Rebalancing Steps
            </h4>
            <div className="space-y-2">
              {auditResult.rebalanceSteps?.map((step: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3 text-xs"
                >
                  <span className="px-2.5 py-1 rounded bg-slate-800 font-bold uppercase text-[10px] text-emerald-400 border border-slate-700 shrink-0">
                    {step.action}
                  </span>
                  <div>
                    <strong className="text-white block font-mono">{step.asset}</strong>
                    <span className="text-slate-400">{step.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Add Holding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Add Portfolio Asset</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Asset Type</label>
                <select
                  value={newType}
                  onChange={(e: any) => setNewType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Stock">NSE/BSE Direct Stock</option>
                  <option value="Mutual Fund">Mutual Fund (Direct SIP/Lumpsum)</option>
                  <option value="Gold">Gold ETF / Sovereign Gold Bond</option>
                  <option value="Fixed Deposit">Debt / Liquid Fund / FD</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Symbol / Code</label>
                <input
                  type="text"
                  placeholder="e.g. INFY, TRENT, PPFC"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Instrument Name</label>
                <input
                  type="text"
                  placeholder="e.g. Infosys Ltd"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Invested Amount (₹)</label>
                  <input
                    type="number"
                    value={newInvested}
                    onChange={(e) => setNewInvested(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Current Value (₹)</label>
                  <input
                    type="number"
                    value={newCurrent}
                    onChange={(e) => setNewCurrent(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAsset}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
              >
                Save Holding
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
