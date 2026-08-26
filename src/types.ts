export interface StockItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number; // in Cr INR
  peRatio: number;
  pbRatio: number;
  dividendYield: number; // %
  roe: number; // %
  high52: number;
  low52: number;
  volume: string;
  sector: string;
  exchange: 'NSE' | 'BSE';
  rsi: number;
  dma50: number;
  dma200: number;
  marketCapCategory: 'Large Cap' | 'Mid Cap' | 'Small Cap';
  sparkline: number[];
  description: string;
  financials: {
    revenueGrowth3Y: number; // %
    profitGrowth3Y: number; // %
    debtToEquity: number;
    promoterHolding: number; // %
    fiiHolding: number; // %
    diiHolding: number; // %
  };
}

export interface MutualFundItem {
  id: string;
  name: string;
  amc: string;
  category: 'Flexi Cap' | 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'ELSS / Tax Saver' | 'Hybrid / Multi-Asset' | 'Debt & Liquid' | 'Index / ETF';
  nav: number;
  changePercent1D: number;
  cagr1Y: number;
  cagr3Y: number;
  cagr5Y: number;
  expenseRatio: number; // %
  aum: number; // in Cr INR
  riskRating: 'Very High' | 'High' | 'Moderate' | 'Low';
  crisilRank: number; // 1 to 5
  fundManager: string;
  minSipAmount: number;
  topHoldings: { company: string; percentage: number }[];
  benchmark: string;
  description: string;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  sparkline: number[];
}

export interface FinancialGoal {
  id: string;
  title: string;
  category: 'retirement' | 'education' | 'house' | 'wealth' | 'car' | 'emergency';
  targetAmount: number;
  targetYears: number;
  currentSavings: number;
  expectedReturnPercent: number;
  inflationPercent: number;
  stepUpPercent: number;
}

export interface GoalCalculationResult {
  futureTargetCorpus: number;
  requiredMonthlySip: number;
  requiredLumpsum: number;
  totalInvestedOverTime: number;
  estimatedGains: number;
  yearlyProjection: {
    year: number;
    investedAmount: number;
    futureValue: number;
    inflationAdjustedCost: number;
  }[];
}

export interface AIAnalysisResponse {
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  summary: string;
  keyDrivers: string[];
  risksAndHeadwinds: string[];
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  valuationVerdict: string;
  recommendedAction: 'Strong Buy' | 'Accumulate' | 'Hold' | 'Trim' | 'Avoid';
  targetHorizon: string;
  suitability: string;
}

export interface PortfolioAsset {
  id: string;
  name: string;
  symbol: string;
  type: 'Stock' | 'Mutual Fund' | 'Gold' | 'Fixed Deposit';
  currentValue: number;
  investedValue: number;
  allocationPercent?: number;
  category?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  url?: string;
  category: 'Equities' | 'Mutual Funds' | 'Economy' | 'Policy & RBI' | 'Earnings';
  summary: string;
  impact: 'Positive' | 'Neutral' | 'Negative';
}
