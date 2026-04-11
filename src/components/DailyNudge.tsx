import { Zap, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function DailyNudge({ onClick }: { onClick?: () => void }) {
  const nudges = [
    { text: "You're 18% under budget this week! Keep it up!", type: "celebration" },
    { text: "Your savings rate hit 22% (goal: 20%). On track for early retirement!", type: "opportunity" },
    { text: "If you maintain this pace, you'll have $2.3M by retirement (+$500k projection)", type: "insight" }
  ];

  const nudge = nudges[Math.floor(Math.random() * nudges.length)];

  return (
    <div 
      onClick={onClick}
      className="p-4 rounded-2xl bg-teal/5 border border-teal/20 flex items-center justify-between group hover:bg-teal/10 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center shadow-lg shadow-teal/20">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-teal uppercase tracking-widest mb-0.5">Daily Wealth Nudge</p>
          <p className="text-sm font-medium text-zinc-200">{nudge.text}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-teal font-bold text-xs opacity-0 group-hover:opacity-100 transition-all">
        Take Action <ArrowRight className="w-3 h-3" />
      </div>
    </div>
  );
}
