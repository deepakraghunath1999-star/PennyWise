import { useState } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp, CheckCircle2, BrainCircuit } from "lucide-react";
import { SimulationResult } from "@/lib/monteCarlo";
import { cn } from "@/lib/utils";
import Markdown from "react-markdown";

interface MilestoneStrategyProps {
  milestone: {
    label: string;
    target: number;
  };
  result: SimulationResult;
}

export function MilestoneStrategy({ milestone, result }: MilestoneStrategyProps) {
  const [strategy, setStrategy] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const generateStrategy = async () => {
    if (strategy) {
      setIsOpen(!isOpen);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);
    try {
      const prompt = `
        As a financial expert, provide a step-by-step actionable plan to reach this milestone:
        Milestone: ${milestone.label}
        Target Amount: $${milestone.target.toLocaleString()}
        
        Current User Context:
        - Age: ${result.currentAge}
        - Annual Income: $${(result.annualContrib / result.savingsRate * 100).toLocaleString()}
        - Monthly Contribution: $${(result.annualContrib / 12).toLocaleString()}
        - Current Savings: $${(result.pctPaths.p50[0].balance).toLocaleString()}
        - Tax Strategy: Taxable/Trad drag is ${result.taxImpact.toFixed(1)}%
        - Withdrawal Strategy: ${result.dynamicAdjustmentAvg > 0 ? 'Dynamic Guardrails' : 'Fixed'}
        
        Provide 3-4 clear, specific steps. Use markdown bullet points. Keep it concise but high value.
        Mention how their specific tax bucket allocation or withdrawal strategy helps or hinders this specific milestone.
      `;

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!res.ok) throw new Error("Failed to call AI");
      const data = await res.json();
      
      setStrategy(data.text || "Unable to generate strategy at this time.");
    } catch (error) {
      console.error("Strategy Error:", error);
      setStrategy("Error generating strategy. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 border-t border-border/50 pt-4">
      <button 
        onClick={generateStrategy}
        className="flex items-center gap-2 text-[10px] font-bold text-teal uppercase tracking-widest hover:text-teal/80 transition-all group"
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <BrainCircuit className="w-3 h-3 group-hover:scale-110 transition-transform" />
        )}
        {strategy ? (isOpen ? "Hide Strategy" : "View AI Strategy") : "Get AI-Driven Strategy"}
        {strategy && (isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
      </button>

      {isOpen && (
        <div className="mt-4 p-6 rounded-2xl bg-zinc-900/80 border border-border shadow-2xl relative overflow-hidden animate-in slide-in-from-top-2 duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal/5 rounded-full -mr-12 -mt-12 blur-2xl" />
          
          {isLoading ? (
            <div className="flex items-center gap-3 py-2 relative z-10">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 bg-teal rounded-full animate-bounce" />
                <div className="h-1.5 w-1.5 bg-teal rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="h-1.5 w-1.5 bg-teal rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-[10px] text-muted font-bold uppercase tracking-widest ml-2">Synthesizing Strategy...</span>
            </div>
          ) : (
            <div className="markdown-body relative z-10">
              <Markdown>{strategy || ""}</Markdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
