import { cn } from "@/lib/utils";

interface ReadinessScoreProps {
  score: number;
}

export function ReadinessScore({ score }: ReadinessScoreProps) {
  const color = score >= 80 ? "text-teal" : score >= 60 ? "text-amber" : "text-red";
  const borderColor = score >= 80 ? "border-teal" : score >= 60 ? "border-amber" : "border-red";
  const bgColor = score >= 80 ? "bg-teal/10" : score >= 60 ? "bg-amber/10" : "bg-red/10";

  return (
    <div className="p-6 rounded-2xl glass flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Retirement Readiness Score</h3>
        <p className="text-muted text-sm max-w-md">
          A composite metric based on your success rate, savings rate, time horizon, and withdrawal rate.
        </p>
      </div>
      
      <div className="relative flex items-center justify-center">
        <div className={cn(
          "w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-500",
          borderColor,
          bgColor
        )}>
          <span className={cn("text-4xl font-bold", color)}>{score}</span>
          <span className="text-[10px] text-muted uppercase font-semibold tracking-tighter">Score</span>
        </div>
        
        {/* Decorative ring */}
        <div className={cn(
          "absolute -inset-2 rounded-full border border-dashed opacity-20 animate-[spin_10s_linear_infinite]",
          borderColor
        )} />
      </div>
    </div>
  );
}
