import React, { useState, useMemo } from 'react';
import { FinancialGoal } from '../types';
import {
  Target,
  Sparkles,
  TrendingUp,
  Calendar,
  DollarSign,
  Percent,
  Layers,
  CheckCircle2,
  ShieldCheck,
  Award,
  Clock,
  ArrowRight,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  formatINR,
  formatNumberIN,
  formatPercent,
  calculateSIPProjections,
  solveRequiredMonthlySip,
} from '../lib/formatters';

export const GoalSIPEngine: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<string>('retirement');
  const [goalTitle, setGoalTitle] = useState('Comfortable Retirement (FIRE)');
  const [targetAmountToday, setTargetAmountToday] = useState<number>(10000000); // 1 Crore
  const [horizonYears, setHorizonYears] = useState<number>(15);
  const [currentSavings, setCurrentSavings] = useState<number>(500000); // 5 Lakhs
  const [expectedReturn, setExpectedReturn] = useState<number>(13); // 13% CAGR
  const [inflationRate, setInflationRate] = useState<number>(6); // 6% Indian inflation
  const [stepUpPercent, setStepUpPercent] = useState<number>(10); // 10% annual step-up

  const [aiLoading, setAiLoading] = useState(false);
  const [aiPlan, setAiPlan] = useState<any | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const presets = [
    {
      id: 'retirement',
      title: 'Comfortable Retirement (FIRE)',
      amount: 25000000,
      years: 18,
      savings: 1000000,
      ret: 13,
      inf: 6,
      step: 10,
      icon: '🏖️',
    },
    {
      id: 'house',
      title: 'Dream Home Downpayment',
      amount: 4000000,
      years: 7,
      savings: 300000,
      ret: 12,
      inf: 6,
      step: 10,
      icon: '🏡',
    },
    {
      id: 'education',
      title: 'Child Higher Education / Overseas MBA',
      amount: 6000000,
      years: 12,
      savings: 200000,
      ret: 13.5,
      inf: 7,
      step: 10,
      icon: '🎓',
    },
    {
      id: 'wealth',
      title: '₹5 Crore Wealth Accumulator',
      amount: 50000000,
      years: 20,
      savings: 500000,
      ret: 14,
      inf: 5.5,
      step: 12,
      icon: '💎',
    },
    {
      id: 'emergency',
      title: '1-Year Emergency Buffer Fund',
      amount: 1200000,
      years: 3,
      savings: 100000,
      ret: 8,
      inf: 5,
      step: 0,
      icon: '🛡️',
    },
  ];

  const applyPreset = (preset: (typeof presets)[0]) => {
    setSelectedPreset(preset.id);
    setGoalTitle(preset.title);
    setTargetAmountToday(preset.amount);
    setHorizonYears(preset.years);
    setCurrentSavings(preset.savings);
    setExpectedReturn(preset.ret);
    setInflationRate(preset.inf);
    setStepUpPercent(preset.step);
    setAiPlan(null);
  };

  // Math Calculations
  // 1. Inflation Adjusted Target Corpus: FV = PV * (1 + inflation)^years
  const futureCorpus = useMemo(() => {
    return Math.round(targetAmountToday * Math.pow(1 + inflationRate / 100, horizonYears));
  }, [targetAmountToday, inflationRate, horizonYears]);

  // 2. Future value of existing current savings
  const futureValueOfSavings = useMemo(() => {
    return Math.round(currentSavings * Math.pow(1 + expectedReturn / 100, horizonYears));
  }, [currentSavings, expectedReturn, horizonYears]);

  // 3. Net shortfall to bridge through monthly SIP
  const netShortfall = useMemo(() => {
    return Math.max(futureCorpus - futureValueOfSavings, 0);
  }, [futureCorpus, futureValueOfSavings]);

  // 4. Solve required monthly SIP
  const requiredMonthlySip = useMemo(() => {
    return solveRequiredMonthlySip(netShortfall, expectedReturn, horizonYears, stepUpPercent);
  }, [netShortfall, expectedReturn, horizonYears, stepUpPercent]);

  // 5. Generate Yearly Compounding Growth Chart Data
  const projection = useMemo(() => {
    return calculateSIPProjections(
      requiredMonthlySip,
      expectedReturn,
      horizonYears,
      stepUpPercent,
      currentSavings
    );
  }, [requiredMonthlySip, expectedReturn, horizonYears, stepUpPercent, currentSavings]);

  const handleGenerateAiPlan = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/gemini/analyze-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalData: {
            title: goalTitle,
            category: selectedPreset,
            targetAmount: targetAmountToday,
            targetYears: horizonYears,
            currentSavings,
            inflationPercent: inflationRate,
            expectedReturnPercent: expectedReturn,
            stepUpPercent,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.plan) {
        setAiPlan(data.plan);
      } else {
        setAiError(data.error || 'Failed to formulate plan');
      }
    } catch (err: any) {
      setAiError(err.message || 'Network error');
    } finally {
      setAiLoading(false);
    }
  };

  const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      
      {/* Goal Presets Banner */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
          Select Goal Template or Customize
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {presets.map((p) => {
            const isSelected = selectedPreset === p.id;
            return (
              <button
                key={p.id}
                id={`preset-btn-${p.id}`}
                onClick={() => applyPreset(p)}
                className={`text-left p-3 rounded-xl border transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md shadow-emerald-950/40'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-950'
                }`}
              >
                <div className="text-xl mb-1.5">{p.icon}</div>
                <div className="text-xs font-bold leading-snug line-clamp-2 text-white">
                  {p.title}
                </div>
                <div className="text-[11px] font-mono text-emerald-400 mt-2 font-semibold">
                  {formatINR(p.amount, true)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Simulator Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Sliders & Inputs (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-5 text-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Goal Parameters
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Real-time Compounding</span>
          </div>

          {/* Goal Title Input */}
          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">Goal Name</label>
            <input
              type="text"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Target Amount Today */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Target Cost in Today's Value:</span>
              <span className="font-bold font-mono text-emerald-400 text-sm">
                {formatINR(targetAmountToday)}
              </span>
            </div>
            <input
              type="range"
              min="500000"
              max="100000000"
              step="500000"
              value={targetAmountToday}
              onChange={(e) => setTargetAmountToday(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>₹5 Lakh</span>
              <span>₹50 Lakh</span>
              <span>₹10 Crore</span>
            </div>
          </div>

          {/* Horizon (Years) */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Investment Horizon:</span>
              <span className="font-bold font-mono text-emerald-400 text-sm">
                {horizonYears} Years
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="35"
              step="1"
              value={horizonYears}
              onChange={(e) => setHorizonYears(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>1 Year</span>
              <span>15 Years</span>
              <span>35 Years</span>
            </div>
          </div>

          {/* Current Existing Savings */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Existing Savings / Lumpsum:</span>
              <span className="font-bold font-mono text-slate-200">
                {formatINR(currentSavings)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20000000"
              step="100000"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          {/* Inflation & Return Row */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Inflation Rate:</span>
                <span className="font-mono font-bold text-amber-400">{inflationRate}%</span>
              </div>
              <input
                type="range"
                min="3"
                max="10"
                step="0.5"
                value={inflationRate}
                onChange={(e) => setInflationRate(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <span className="text-[10px] text-slate-500 block">India avg ~5-6%</span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Expected CAGR:</span>
                <span className="font-mono font-bold text-emerald-400">{expectedReturn}%</span>
              </div>
              <input
                type="range"
                min="7"
                max="18"
                step="0.5"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <span className="text-[10px] text-slate-500 block">Equity MF ~12-14%</span>
            </div>
          </div>

          {/* Annual Step-Up SIP */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Annual Step-Up SIP:</span>
              <span className="font-mono font-bold text-emerald-400">+{stepUpPercent}% / year</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="5"
              value={stepUpPercent}
              onChange={(e) => setStepUpPercent(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Increasing your SIP amount annually by {stepUpPercent}% as your salary grows reduces initial monthly burden by up to 40%.
            </p>
          </div>

        </div>

        {/* Right Column: Key Outcomes & Projection Graph (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Key Outcome Numbers Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Required Monthly SIP */}
            <div className="bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-950 border border-emerald-900/50 p-5 rounded-2xl shadow-lg">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                Required Starting Monthly SIP
              </span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {formatINR(requiredMonthlySip)}
                <span className="text-xs text-slate-400 font-sans font-normal ml-1">/ month</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                With a {stepUpPercent}% annual step-up over {horizonYears} years.
              </p>
            </div>

            {/* Inflation-Adjusted Future Corpus */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Inflation-Adjusted Target Corpus
              </span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-300">
                {formatINR(futureCorpus, true)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Exact target value needed in Year {new Date().getFullYear() + horizonYears} at {inflationRate}% inflation.
              </p>
            </div>

          </div>

          {/* Wealth Growth Graph */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Compounding Trajectory Over {horizonYears} Years
                </h4>
                <p className="text-[11px] text-slate-400">Total Invested vs Estimated Wealth Gained</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                  Invested
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Corpus
                </span>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projection.yearlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFV" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorInv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="year"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => `Yr ${v}`}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(v) => formatINR(v, true)}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    formatter={(value: any, name: any) => [
                      formatINR(Number(value)),
                      name === 'futureValue' ? 'Target Corpus' : 'Total Invested',
                    ]}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="invested"
                    stroke="#64748b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorInv)"
                  />
                  <Area
                    type="monotone"
                    dataKey="futureValue"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorFV)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block">Total Capital Invested:</span>
                <span className="font-mono font-bold text-white">{formatINR(projection.totalInvested)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Estimated Capital Gains (Alpha):</span>
                <span className="font-mono font-bold text-emerald-400">+{formatINR(projection.wealthGained)}</span>
              </div>
            </div>
          </div>

          {/* AI Roadmap Trigger Button */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-900/40 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                AI Custom Asset Allocation & Roadmap
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate tailored Indian stock & mutual fund basket, rebalancing milestones, and tax optimization tips.
              </p>
            </div>

            <button
              id="btn-generate-ai-plan"
              onClick={handleGenerateAiPlan}
              disabled={aiLoading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
              <span>{aiLoading ? 'Formulating Plan...' : 'Generate AI Plan'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* Gemini AI Goal Plan Output Presentation */}
      {aiLoading && (
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3 animate-pulse">
          <Sparkles className="w-8 h-8 text-emerald-400 mx-auto animate-spin" />
          <p className="text-sm font-semibold text-slate-200">
            Formulating custom asset allocation across Flexi Cap, Mid Cap, Small Cap, Gold & Debt instruments...
          </p>
          <span className="text-xs text-slate-500">Gemini 3.7 Flash Wealth Advisory Engine</span>
        </div>
      )}

      {aiError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{aiError}</span>
        </div>
      )}

      {aiPlan && (
        <div className="bg-slate-900 border border-emerald-900/40 p-6 rounded-2xl shadow-2xl space-y-6 text-white">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-2">
            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Personalized Wealth Blueprint
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">{goalTitle}</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                Corpus Goal: <strong className="text-emerald-400 font-mono">{aiPlan.futureCorpusNeeded}</strong>
              </span>
            </div>
          </div>

          {/* Executive Strategy */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-white block mb-1">Executive Summary:</span>
            <p>{aiPlan.executivePlan}</p>
          </div>

          {/* Asset Allocation Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Recommended Asset Allocation Matrix
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {aiPlan.assetAllocation?.map((asset: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-slate-200">{asset.assetClass}</span>
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {asset.percentage}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{asset.rationale}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Recommended Instruments:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {asset.recommendedInstruments?.map((inst: string, i: number) => (
                        <span
                          key={i}
                          className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono"
                        >
                          {inst}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones Roadmap */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Milestone Checkpoints & Rebalancing Timeline
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {aiPlan.milestones?.map((m: any, idx: number) => (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Year {m.year}</span>
                    <span className="text-xs font-mono font-semibold text-amber-300 ml-auto">
                      Target: {m.targetCorpus}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{m.rebalancingAdvice}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Optimization & Risk Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div className="bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-xl">
              <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                <ShieldCheck className="w-4 h-4" />
                Indian Income Tax Optimization (Union Budget)
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {aiPlan.taxOptimizationTips?.map((tip: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <h5 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
                <Award className="w-4 h-4 text-amber-400" />
                Glide-Path & Risk Management
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {aiPlan.riskManagementTips?.map((tip: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-slate-500 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
