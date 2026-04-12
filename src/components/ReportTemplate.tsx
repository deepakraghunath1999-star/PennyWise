import { SimulationInput, SimulationResult } from "@/lib/monteCarlo";
import { formatCurrency } from "@/lib/utils";
import { Zap, TrendingUp, Target, ShieldAlert, Briefcase, DollarSign, Sparkles } from "lucide-react";

interface ReportTemplateProps {
  params: SimulationInput;
  result: SimulationResult | null;
  scenarios?: any[];
  aiInsight?: string | null;
}

export function ReportTemplate({ params, result, scenarios = [], aiInsight }: ReportTemplateProps) {
  if (!result) return null;

  return (
    <div id="pdf-report-template" className="w-[800px] bg-[#0a0a0a] text-white p-12 space-y-10 font-sans">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-zinc-800 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal rounded-xl flex items-center justify-center shadow-lg shadow-teal/20">
            <Zap className="w-7 h-7 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Financial Strategy Report</h1>
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-mono">Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-teal tracking-tighter italic">PennyWise</div>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em]">Intelligence Engine v2.4</p>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-3 gap-6">
        <div className="p-8 rounded-[2rem] bg-zinc-900 border border-zinc-800 space-y-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal/5 rounded-full -mr-12 -mt-12 blur-2xl" />
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest relative z-10">Success Probability</p>
          <p className="text-4xl font-bold text-teal relative z-10">{result.successRate.toFixed(1)}%</p>
        </div>
        <div className="p-8 rounded-[2rem] bg-zinc-900 border border-zinc-800 space-y-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber/5 rounded-full -mr-12 -mt-12 blur-2xl" />
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest relative z-10">Readiness Score</p>
          <p className="text-4xl font-bold text-amber relative z-10">{result.readinessScore}/100</p>
        </div>
        <div className="p-8 rounded-[2rem] bg-zinc-900 border border-zinc-800 space-y-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-100/5 rounded-full -mr-12 -mt-12 blur-2xl" />
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest relative z-10">Retirement Wealth</p>
          <p className="text-4xl font-bold text-zinc-100 relative z-10">{formatCurrency(result.projectedAtRetirement)}</p>
        </div>
      </div>

      {/* AI Strategic Insight */}
      {aiInsight && (
        <div className="p-8 rounded-[2rem] bg-teal/5 border border-teal/20 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal/10 rounded-full -mr-24 -mt-24 blur-3xl" />
          <h2 className="text-xl font-bold flex items-center gap-3 text-teal relative z-10">
            <Sparkles className="w-6 h-6" /> AI Strategic Insight
          </h2>
          <p className="text-lg text-zinc-200 leading-relaxed font-medium relative z-10 italic">
            "{aiInsight}"
          </p>
        </div>
      )}

      {/* Simulation Parameters */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-3 text-zinc-100">
          <Target className="w-6 h-6 text-teal" /> Core Simulation Parameters
        </h2>
        <div className="grid grid-cols-2 gap-x-12 gap-y-6 p-10 rounded-[2.5rem] bg-zinc-900/50 border border-zinc-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-100/[0.02] to-transparent" />
          <div className="flex justify-between border-b border-zinc-800/50 pb-3 relative z-10">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Current Age</span>
            <span className="font-bold text-zinc-100">{params.currentAge}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-800/50 pb-3 relative z-10">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Retirement Age</span>
            <span className="font-bold text-zinc-100">{params.retirementAge}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-800/50 pb-3 relative z-10">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Annual Income</span>
            <span className="font-bold text-zinc-100">{formatCurrency(params.annualIncome)}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-800/50 pb-3 relative z-10">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Monthly Savings</span>
            <span className="font-bold text-zinc-100">{formatCurrency(params.monthlyContrib)}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-800/50 pb-3 relative z-10">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Retirement Spending</span>
            <span className="font-bold text-zinc-100">{formatCurrency(params.retMonthly)}/mo</span>
          </div>
          <div className="flex justify-between border-b border-zinc-800/50 pb-3 relative z-10">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Risk Profile</span>
            <span className="font-bold capitalize text-zinc-100">{params.riskProfile}</span>
          </div>
        </div>
      </div>

      {/* Wealth Lab Insights */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-3 text-zinc-100">
          <Zap className="w-6 h-6 text-amber" /> Wealth Lab Optimization
        </h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="p-8 rounded-[2rem] border border-zinc-800 space-y-4 bg-zinc-900/30">
            <div className="flex items-center gap-3 text-amber">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Income Growth</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Potential to increase income by 25% through skill gap optimization and career-aligned side hustles.
            </p>
          </div>
          <div className="p-8 rounded-[2rem] border border-zinc-800 space-y-4 bg-zinc-900/30">
            <div className="flex items-center gap-3 text-blue-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Expense Audit</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Identified $4,150 in annual savings through subscription cleanup and bill negotiation.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-16 border-t border-zinc-800 text-center">
        <p className="text-[10px] text-zinc-600 uppercase tracking-[0.4em] font-bold">
          Confidential Financial Intelligence • PennyWise Neural Engine v2.4
        </p>
      </div>
    </div>
  );
}
