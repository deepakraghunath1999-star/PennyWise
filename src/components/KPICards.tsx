import * as React from "react";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import { SimulationResult } from "@/lib/monteCarlo";

interface KPICardsProps {
  result: SimulationResult | null;
}

export function KPICards({ result }: KPICardsProps) {
  if (!result) return null;

  const cards = [
    {
      label: "Success Rate",
      value: `${result.successRate.toFixed(1)}%`,
      sub: "Simulations ending ≥ $0",
      color: result.successRate >= 80 ? "text-teal" : result.successRate >= 60 ? "text-amber" : "text-red",
    },
    {
      label: "Projected Wealth",
      value: formatCompactNumber(result.projectedAtRetirement),
      sub: "At retirement (median)",
      color: "text-teal",
    },
    {
      label: "Required Nest Egg",
      value: formatCompactNumber(result.requiredNestEgg),
      sub: "4% rule for withdrawals",
      color: "text-amber",
    },
    {
      label: "Savings Rate",
      value: `${result.savingsRate.toFixed(1)}%`,
      sub: "Benchmark: 15%",
      color: result.savingsRate >= 15 ? "text-teal" : "text-amber",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="p-4 rounded-xl border border-border bg-card card-gradient">
          <div className="text-xs font-mono text-muted uppercase tracking-wider">{card.label}</div>
          <div className={`text-3xl font-bold mt-2 ${card.color}`}>{card.value}</div>
          <div className="text-[10px] text-muted mt-1">{card.sub}</div>
        </div>
      ))}
    </div>
  );
}
