/**
 * Monte Carlo Retirement Simulator Engine
 */

export interface RiskProfile {
  mean: number;
  stdDev: number;
}

export const RISK_PROFILES: Record<string, RiskProfile> = {
  conservative: { mean: 0.05, stdDev: 0.08 },
  moderate: { mean: 0.07, stdDev: 0.12 },
  aggressive: { mean: 0.09, stdDev: 0.16 },
};

export interface SimulationInput {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentSavings: number;
  annualIncome: number;
  monthlyContrib: number;
  retMonthly: number;
  riskProfile: string;
  // Tax Buckets
  taxableRatio: number; // 0-1
  rothRatio: number;    // 0-1
  tradRatio: number;    // 0-1
  // Dynamic Withdrawal
  useDynamicWithdrawal: boolean;
  inflationRate: number;
  // Linked Data
  isLinked?: boolean;
  linkedBankBalance?: number;
  linkedMonthlyIncome?: number;
  linkedMonthlySpending?: number;
  lastSyncDate?: string;
}

export interface SimulationResult {
  successRate: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  mean: number;
  stdDev: number;
  pctPaths: { 
    p10: { age: number; balance: number }[]; 
    p50: { age: number; balance: number }[]; 
    p90: { age: number; balance: number }[]; 
  };
  yearsToRetire: number;
  yearsInRetirement: number;
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  annualContrib: number;
  annualWithdrawal: number;
  requiredNestEgg: number;
  savingsRate: number;
  readinessScore: number;
  projectedAtRetirement: number;
  // New metrics
  taxImpact: number;
  dynamicAdjustmentAvg: number;
}

function lognormalRandom(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.exp(z0 * stdDev + mean);
}

export function calculateReadinessScore(
  successRate: number, 
  savingsRate: number, 
  yearsToRetire: number, 
  withdrawalRate: number
): number {
  const score = (
    (successRate / 100) * 0.40 +
    (Math.min(savingsRate, 20) / 20) * 0.25 +
    (Math.min(yearsToRetire, 50) / 50) * 0.20 +
    (Math.max(0, 1 - withdrawalRate / 0.05)) * 0.15
  ) * 100;
  return Math.round(score);
}

export function runSimulation(input: SimulationInput): SimulationResult {
  const profile = RISK_PROFILES[input.riskProfile] || RISK_PROFILES.moderate;
  const yearsToRetire = input.retirementAge - input.currentAge;
  const yearsInRetirement = input.lifeExpectancy - input.retirementAge;
  const totalYears = yearsToRetire + yearsInRetirement;
  
  const N = 5000;
  const finalValues: number[] = [];
  const allPaths: number[][] = [];
  
  const annualContrib = input.monthlyContrib * 12;
  const baseAnnualWithdrawal = input.retMonthly * 12;
  const inflation = input.inflationRate || 0.02;

  // Tax assumptions
  const effectiveTaxRate = 0.20; // Simplified average tax rate for Traditional/Taxable
  
  for (let sim = 0; sim < N; sim++) {
    let balance = input.currentSavings;
    const path: number[] = [balance];
    let currentWithdrawal = baseAnnualWithdrawal;
    
    // Accumulation
    for (let y = 1; y <= yearsToRetire; y++) {
      const annualReturn = lognormalRandom(Math.log(1 + profile.mean), profile.stdDev);
      balance = balance * annualReturn + annualContrib;
      path.push(Math.max(0, balance));
    }
    
    // Withdrawal
    for (let y = 1; y <= yearsInRetirement; y++) {
      const annualReturn = lognormalRandom(Math.log(1 + profile.mean), profile.stdDev);
      
      // Dynamic Withdrawal (Guardrails)
      if (input.useDynamicWithdrawal) {
        // Guyton-Klinger simplified: If return is negative, don't increase for inflation
        // If portfolio drops significantly, reduce withdrawal by 10%
        if (annualReturn < 1.0) {
          // No inflation adjustment
        } else {
          currentWithdrawal *= (1 + inflation);
        }
        
        const currentWR = currentWithdrawal / balance;
        if (currentWR > 0.06) { // Capital preservation rule
          currentWithdrawal *= 0.9;
        }
      } else {
        currentWithdrawal *= (1 + inflation);
      }

      // Tax Awareness
      // We need to withdraw MORE to get the same net if it's from taxable/trad
      // Net = Gross * (1 - TaxRate) => Gross = Net / (1 - TaxRate)
      const taxablePortion = input.taxableRatio + input.tradRatio;
      const rothPortion = input.rothRatio;
      
      const neededGross = (currentWithdrawal * rothPortion) + 
                          ((currentWithdrawal * taxablePortion) / (1 - effectiveTaxRate));

      balance = balance * annualReturn - neededGross;
      path.push(Math.max(0, balance));
    }
    
    finalValues.push(balance);
    allPaths.push(path);
  }
  
  const sorted = [...finalValues].sort((a, b) => a - b);
  const p10 = sorted[Math.floor(N * 0.10)];
  const p50 = sorted[Math.floor(N * 0.50)];
  const p90 = sorted[Math.floor(N * 0.90)];
  
  const successCount = finalValues.filter(v => v >= 0).length;
  const successRate = (successCount / N) * 100;
  
  const p10Path: { age: number; balance: number }[] = [];
  const p50Path: { age: number; balance: number }[] = [];
  const p90Path: { age: number; balance: number }[] = [];
  
  for (let i = 0; i <= totalYears; i++) {
    const valuesAtYear = allPaths.map(p => p[i]).sort((a, b) => a - b);
    const age = input.currentAge + i;
    p10Path.push({ age, balance: valuesAtYear[Math.floor(N * 0.10)] });
    p50Path.push({ age, balance: valuesAtYear[Math.floor(N * 0.50)] });
    p90Path.push({ age, balance: valuesAtYear[Math.floor(N * 0.90)] });
  }
  
  const withdrawalRate = baseAnnualWithdrawal / (p50Path[yearsToRetire]?.balance || 1);
  const readinessScore = calculateReadinessScore(
    successRate,
    (annualContrib / input.annualIncome) * 100,
    yearsToRetire,
    withdrawalRate
  );

  return {
    successRate,
    p10,
    p25: sorted[Math.floor(N * 0.25)],
    p50,
    p75: sorted[Math.floor(N * 0.75)],
    p90,
    mean: finalValues.reduce((a, b) => a + b, 0) / N,
    stdDev: Math.sqrt(finalValues.reduce((a, b) => a + Math.pow(b - (finalValues.reduce((x, y) => x + y, 0) / N), 2), 0) / N),
    pctPaths: { p10: p10Path, p50: p50Path, p90: p90Path },
    yearsToRetire,
    yearsInRetirement,
    currentAge: input.currentAge,
    retirementAge: input.retirementAge,
    lifeExpectancy: input.lifeExpectancy,
    annualContrib,
    annualWithdrawal: baseAnnualWithdrawal,
    requiredNestEgg: (baseAnnualWithdrawal) / 0.04,
    savingsRate: (annualContrib / input.annualIncome) * 100,
    readinessScore,
    projectedAtRetirement: p50Path[yearsToRetire].balance,
    taxImpact: (input.taxableRatio + input.tradRatio) * effectiveTaxRate * 100,
    dynamicAdjustmentAvg: input.useDynamicWithdrawal ? 0.05 : 0
  };
}
