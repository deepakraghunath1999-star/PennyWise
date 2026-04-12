import { useState, useEffect } from "react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { SimulationResult } from "@/lib/monteCarlo";
import { cn } from "@/lib/utils";

interface GeminiInsightProps {
  result: SimulationResult | null;
  lastRunTimestamp?: number;
}

export function GeminiInsight({ result, lastRunTimestamp }: GeminiInsightProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!result || !lastRunTimestamp) return;

    const generateInsight = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const prompt = `
          As a financial expert, give a 1-sentence punchy insight for this retirement simulation:
          - Success Rate: ${result.successRate.toFixed(1)}%
          - Readiness Score: ${result.readinessScore}/100
          - Current Age: ${result.currentAge}
          - Retirement Age: ${result.retirementAge}
          - Projected Wealth: $${result.projectedAtRetirement.toLocaleString()}
          
          Focus on the most critical action or observation. Be direct.
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
        
        setInsight(data.text || "Keep optimizing your plan.");
      } catch (err: any) {
        console.error("Insight Error:", err);
        let msg = "Could not generate insight.";
        if (err?.message?.includes('quota') || err?.message?.includes('429')) {
          msg = "AI Insight is at capacity. Add your own API key in Settings.";
        }
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(generateInsight, 1000); // Debounce
    return () => clearTimeout(timer);
  }, [result, lastRunTimestamp]);

  if (!result) return null;

  return (
    <div className="p-4 rounded-2xl bg-teal/5 border border-teal/20 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center shrink-0 border border-teal/20">
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-teal animate-spin" />
        ) : (
          <Sparkles className="w-5 h-5 text-teal" />
        )}
      </div>
      <div className="flex-1">
        <div className="text-[10px] font-bold text-teal uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
          Groq AI Insight
          {isLoading && <span className="inline-block w-1 h-1 rounded-full bg-teal animate-ping" />}
        </div>
        <p className={cn(
          "text-sm font-medium leading-relaxed transition-all duration-300",
          isLoading ? "opacity-50 blur-[2px]" : "opacity-100 blur-0",
          error ? "text-red-400" : "text-zinc-200"
        )}>
          {error || insight || "Analyzing your trajectory..."}
        </p>
      </div>
    </div>
  );
}
