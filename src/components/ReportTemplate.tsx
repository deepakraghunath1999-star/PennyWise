import { SimulationInput, SimulationResult } from "@/lib/monteCarlo";
import { formatCurrency } from "@/lib/utils";
import { Zap, TrendingUp, Target, ShieldAlert, Briefcase, DollarSign, Sparkles } from "lucide-react";

interface ReportTemplateProps {
  params: SimulationInput;
  result: SimulationResult | null;
  scenarios?: any[];
}

export function ReportTemplate({ params, result, scenarios = [] }: ReportTemplateProps) {
  if (!result) return null;

  return (
    <div id="pdf-report-template" className="w-[800px] bg-[#0a0a0a] text-white p-12 space-y-10 font-sans">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-zinc-800 pb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-teal mb-2">Retirement Strategy Report</h1>
          <p className="text-zinc-400 text-sm">Generated on {new Date().toLocaleDateString()} • DevFest Demo Edition</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-zinc-100">RetireSim AI</div>
          <p className="text-xs text-teal font-bold uppercase tracking-widest">Financial Independence Plan</p>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Success Probability</p>
          <p className="text-3xl font-bold text-teal">{result.successRate.toFixed(1)}%</p>
        </div>
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Readiness Score</p>
          <p className="text-3xl font-bold text-amber">{result.readinessScore}/100</p>
        </div>
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-2">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Retirement Wealth</p>
          <p className="text-3xl font-bold text-zinc-100">{formatCurrency(result.projectedAtRetirement)}</p>
        </div>
      </div>

      {/* Simulation Parameters */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Target className="w-5 h-5 text-teal" /> Simulation Parameters
        </h2>
        <div className="grid grid-cols-2 gap-x-12 gap-y-4 p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800">
          <div className="flex justify-between border-b border-zinc-800/50 pb-2">
            <span className="text-zinc-400 text-sm">Current Age</span>
            <span className="font-bold">{params.currentAge}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-800/50 pb-2">
            <span className="text-zinc-400 text-sm">Retirement Age</span>
            <span className="font-bold">{params.retirementAge}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-800/50 pb-2">
            <span className="text-zinc-400 text-sm">Annual Income</span>
            <span className="font-bold">{formatCurrency(params.annualIncome)}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-800/50 pb-2">
            <span className="text-zinc-400 text-sm">Monthly Savings</span>
            <span className="font-bold">{formatCurrency(params.monthlyContrib)}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-800/50 pb-2">
            <span className="text-zinc-400 text-sm">Retirement Spending</span>
            <span className="font-bold">{formatCurrency(params.retMonthly)}/mo</span>
          </div>
          <div className="flex justify-between border-b border-zinc-800/50 pb-2">
            <span className="text-zinc-400 text-sm">Risk Profile</span>
            <span className="font-bold capitalize">{params.riskProfile}</span>
          </div>
        </div>
      </div>

      {/* Wealth Lab Insights */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber" /> Wealth Lab Optimization
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-amber">
              <TrendingUp className="w-4 h-4" />
              <h3 className="font-bold text-sm">Income Growth</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Potential to increase income by 25% through skill gap optimization and career-aligned side hustles.
            </p>
          </div>
          <div className="p-6 rounded-3xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-blue-400">
              <ShieldAlert className="w-4 h-4" />
              <h3 className="font-bold text-sm">Expense Audit</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Identified $4,150 in annual savings through subscription cleanup and bill negotiation.
            </p>
          </div>
        </div>
      </div>

      {/* Saved Scenarios */}
      {scenarios.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal" /> Alternative Scenarios
          </h2>
          <div className="space-y-3">
            {scenarios.slice(0, 3).map((s, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-sm font-bold">{s.name}</span>
                <div className="flex gap-4">
                  <span className="text-xs text-teal font-bold">{s.metrics.successRate.toFixed(1)}% Success</span>
                  <span className="text-xs text-amber font-bold">{s.metrics.readinessScore}/100 Score</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Advisor Recommendations */}
      <div className="p-8 rounded-3xl bg-teal/5 border border-teal/20 space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-teal">
          <Sparkles className="w-5 h-5" /> AI Strategist Recommendations
        </h2>
        <ul className="space-y-3">
          <li className="flex items-start gap-3 text-sm text-zinc-300">
            <div className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
            <span>Increase monthly contributions by $300 to reach 95% success probability.</span>
          </li>
          <li className="flex items-start gap-3 text-sm text-zinc-300">
            <div className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
            <span>Consider a Roth conversion strategy to optimize for future tax brackets.</span>
          </li>
          <li className="flex items-start gap-3 text-sm text-zinc-300">
            <div className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
            <span>Implement dynamic withdrawal guardrails to protect capital during market downturns.</span>
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div className="pt-12 border-t border-zinc-800 text-center">
        <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">
          Confidential Financial Simulation • RetireSim AI v2.4
        </p>
      </div>
    </div>
  );
}
