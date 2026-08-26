// Formats numbers into Indian Rupees formatting (₹ 1,25,000 or ₹ 12.4 Cr)
export function formatINR(val: number, compact: boolean = false): string {
  if (val === undefined || val === null || isNaN(val)) return '₹0';

  if (compact) {
    if (Math.abs(val) >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(val) >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakh`;
    }
    if (Math.abs(val) >= 1000) {
      return `₹${(val / 1000).toFixed(1)}k`;
    }
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(val);
}

export function formatNumberIN(val: number): string {
  if (val === undefined || isNaN(val)) return '0';
  return new Intl.NumberFormat('en-IN').format(val);
}

export function formatPercent(val: number, includeSign: boolean = true): string {
  if (val === undefined || isNaN(val)) return '0.00%';
  const sign = includeSign && val > 0 ? '+' : '';
  return `${sign}${val.toFixed(2)}%`;
}

// SIP Math calculation including annual step-up option
export function calculateSIPProjections(
  monthlySip: number,
  expectedReturnRatePercent: number,
  years: number,
  stepUpPercent: number = 0,
  initialLumpsum: number = 0
) {
  const r = expectedReturnRatePercent / 100 / 12;
  const totalMonths = Math.round(years * 12);
  const yearlyData = [];

  let currentMonthlySip = monthlySip;
  let totalInvested = initialLumpsum;
  let corpus = initialLumpsum;

  for (let m = 1; m <= totalMonths; m++) {
    // Add monthly SIP
    corpus = (corpus + currentMonthlySip) * (1 + r);
    totalInvested += currentMonthlySip;

    // Apply annual step-up after every 12 months
    if (m % 12 === 0) {
      const yearNumber = m / 12;
      yearlyData.push({
        year: yearNumber,
        invested: Math.round(totalInvested),
        futureValue: Math.round(corpus),
        wealthGained: Math.round(corpus - totalInvested),
      });

      if (stepUpPercent > 0) {
        currentMonthlySip = currentMonthlySip * (1 + stepUpPercent / 100);
      }
    }
  }

  return {
    totalInvested: Math.round(totalInvested),
    futureValue: Math.round(corpus),
    wealthGained: Math.round(corpus - totalInvested),
    yearlyData,
  };
}

// Solves for required monthly SIP given a future inflation-adjusted target corpus
export function solveRequiredMonthlySip(
  futureTarget: number,
  expectedReturnRatePercent: number,
  years: number,
  stepUpPercent: number = 0
): number {
  if (years <= 0 || expectedReturnRatePercent <= 0) return 0;

  // Binary search solver for non-linear step-up SIP equation
  let low = 100;
  let high = futureTarget;
  let bestSip = 5000;

  for (let iter = 0; iter < 40; iter++) {
    const mid = (low + high) / 2;
    const result = calculateSIPProjections(mid, expectedReturnRatePercent, years, stepUpPercent);
    if (Math.abs(result.futureValue - futureTarget) < 1000) {
      bestSip = mid;
      break;
    }
    if (result.futureValue < futureTarget) {
      low = mid;
    } else {
      high = mid;
      bestSip = mid;
    }
  }

  return Math.round(bestSip);
}
