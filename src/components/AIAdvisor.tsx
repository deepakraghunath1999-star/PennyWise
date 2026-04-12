import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Loader2, Bot, User, Info, AlertCircle, TrendingUp, Target } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SimulationResult, SimulationInput } from "@/lib/monteCarlo";
import { cn } from "@/lib/utils";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAdvisorProps {
  result: SimulationResult | null;
  params: SimulationInput;
}

export function AIAdvisor({ result, params }: AIAdvisorProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  const initialMessage = (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-teal/20 border border-teal/30 flex items-center justify-center shadow-lg shadow-teal/10">
          <Sparkles className="w-6 h-6 text-teal" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-zinc-100">Retirement Strategist v2.4</h3>
          <p className="text-[10px] font-bold text-teal uppercase tracking-widest">AI-Powered Analysis Active</p>
        </div>
      </div>
      
      <p className="text-sm text-zinc-300 leading-relaxed">
        Hello! I've analyzed your current simulation data. I'm ready to help you stress-test your future and optimize your path to financial independence.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {[
          { icon: TrendingUp, label: "Scenario Analysis", desc: "Test inflation or early retirement", prompt: "Can you run a scenario analysis for me? I want to see how different inflation rates or an earlier retirement age would affect my plan." },
          { icon: AlertCircle, label: "Stress-Testing", desc: "Market volatility impact", prompt: "I'd like to stress-test my plan. How would a major market downturn or prolonged high inflation impact my success rate?" },
          { icon: Target, label: "Optimization", desc: "Steps to increase success rate", prompt: "What specific steps can I take to optimize my plan and increase my success rate and readiness score?" },
          { icon: Info, label: "Tax Strategies", desc: "Roth & withdrawal guardrails", prompt: "What tax strategies should I consider? Specifically, how should I balance Roth vs Traditional accounts and what withdrawal guardrails do you recommend?" }
        ].map((item, i) => (
          <div 
            key={i} 
            onClick={() => handleSend(item.prompt)}
            className="p-3 rounded-xl bg-zinc-900/50 border border-border/50 hover:border-teal/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-1">
              <item.icon className="w-4 h-4 text-teal group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-zinc-200">{item.label}</span>
            </div>
            <p className="text-[10px] text-muted leading-tight">{item.desc}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted italic pt-2 border-t border-border/30">
        What's on your mind regarding your financial independence today?
      </p>
    </div>
  );

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (overrideMessage?: string) => {
    const userMessage = overrideMessage || input;
    if (!userMessage.trim() || isLoading) return;

    if (!overrideMessage) setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const context = result ? `
        Current Simulation Context:
        - Current Age: ${result.currentAge}
        - Retirement Age: ${result.retirementAge}
        - Life Expectancy: ${result.lifeExpectancy}
        - Success Rate: ${result.successRate.toFixed(1)}%
        - Readiness Score: ${result.readinessScore}/100
        - Projected Wealth at Retirement (Median): $${result.projectedAtRetirement.toLocaleString()}
        - Required Nest Egg (Target): $${result.requiredNestEgg.toLocaleString()}
        - Annual Income: $${params.annualIncome.toLocaleString()}
        - Annual Contribution: $${result.annualContrib.toLocaleString()} ($${(result.annualContrib / 12).toFixed(0)}/mo)
        - Retirement Annual Withdrawal: $${result.annualWithdrawal.toLocaleString()} ($${(result.annualWithdrawal / 12).toFixed(0)}/mo)
        - Savings Rate: ${result.savingsRate.toFixed(1)}%
        - Risk Profile: ${params.riskProfile}
        - Current Savings: $${params.currentSavings.toLocaleString()}
        - Tax Impact: ${result.taxImpact.toFixed(1)}% effective drag
        - Withdrawal Strategy: ${params.useDynamicWithdrawal ? 'Dynamic Guardrails' : 'Fixed Inflation-Adjusted'}
        - Tax Buckets: Taxable (${(params.taxableRatio * 100).toFixed(0)}%), Roth (${(params.rothRatio * 100).toFixed(0)}%), Trad (${(params.tradRatio * 100).toFixed(0)}%)
        - Bank Link Status: ${params.isLinked ? 'Linked' : 'Not Linked'}
        ${params.isLinked ? `- Linked Balance: $${params.linkedBankBalance?.toLocaleString()}` : ''}
      ` : "No simulation data available yet.";

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: `You are a world-class financial advisor specializing in retirement planning and Monte Carlo simulations. 
            Use the following context to answer the user's question.
            
            Guidelines:
            1. Be professional, actionable, and highly analytical.
            2. Use markdown (bold, bullets, headers) for readability.
            3. If the success rate is low (< 70%), prioritize aggressive suggestions to increase contributions, delay retirement, or optimize tax buckets.
            4. If the user asks for a scenario, explain the trade-offs clearly using the provided simulation metrics.
            5. Mention the "Wealth Lab" tools (Nudge Engine, Income Optimizer, etc.) if they can help with the user's specific problem.
            
            ${context}`,
          messages: [{ role: 'user', content: userMessage }]
        })
      });

      if (!res.ok) throw new Error("Failed to call AI");
      const data = await res.json();

      setMessages(prev => [...prev, { role: 'assistant', content: data.text || "I'm sorry, I couldn't generate a response." }]);
    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMessage = "I encountered an error while analyzing your data. Please try again.";
      
      if (error?.message?.includes('quota') || error?.message?.includes('429')) {
        errorMessage = "The AI Advisor is currently at its capacity (API Quota Exceeded). As a DevFest Demo, you can continue using the simulator, or try again in a few minutes. If you are a developer, you can provide your own Gemini API key in the environment settings.";
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[700px] glass rounded-[2rem] overflow-hidden border border-border shadow-2xl shadow-teal/5">
      <div className="p-6 border-b border-border bg-card/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal/10 rounded-2xl flex items-center justify-center border border-teal/20 shadow-inner">
            <Sparkles className="w-6 h-6 text-teal" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight">AI Retirement Strategist</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
              <p className="text-[10px] text-muted uppercase tracking-widest font-bold">Analysis Mode Active</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-border">
          <Sparkles className="w-3 h-3 text-amber" />
          <span className="text-[10px] font-bold text-amber uppercase tracking-widest">DevFest Demo</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-border">
          <Info className="w-3 h-3 text-muted" />
          <span className="text-[10px] font-bold text-muted uppercase tracking-widest">v2.4 Pro</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
        {/* Initial Pro Message */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-start"
        >
          <div className="max-w-[85%] rounded-[2rem] p-8 bg-zinc-900/50 border border-border shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-teal/10 transition-all duration-1000" />
            {initialMessage}
          </div>
        </motion.div>

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={cn(
                "flex gap-4 max-w-[90%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm",
                msg.role === 'assistant' ? "bg-teal/10 border-teal/20" : "bg-zinc-800 border-border"
              )}>
                {msg.role === 'assistant' ? <Bot className="w-5 h-5 text-teal" /> : <User className="w-5 h-5 text-zinc-400" />}
              </div>
              <div className={cn(
                "p-5 rounded-[1.5rem] text-sm leading-relaxed shadow-sm",
                msg.role === 'assistant' 
                  ? "bg-zinc-900/50 border border-border text-zinc-200" 
                  : "bg-teal text-white shadow-lg shadow-teal/10"
              )}>
                <div className="whitespace-pre-wrap">
                  {msg.content.split('\n').map((line, j) => (
                    <p key={j} className={cn(line.trim() === "" ? "h-4" : "mb-1")}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 max-w-[90%]"
          >
            <div className="w-10 h-10 rounded-2xl bg-teal/10 border border-teal/20 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-teal" />
            </div>
            <div className="p-5 rounded-[1.5rem] bg-zinc-900/50 border border-border flex items-center gap-3">
              <div className="flex gap-1">
                <motion.div 
                  animate={{ scale: [1, 1.5, 1] }} 
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-1.5 h-1.5 rounded-full bg-teal" 
                />
                <motion.div 
                  animate={{ scale: [1, 1.5, 1] }} 
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-teal" 
                />
                <motion.div 
                  animate={{ scale: [1, 1.5, 1] }} 
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  className="w-1.5 h-1.5 rounded-full bg-teal" 
                />
              </div>
              <span className="text-xs font-bold text-muted uppercase tracking-widest">Processing Simulation...</span>
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-6 border-t border-border bg-card/50">
        <div className="relative flex items-center gap-3 bg-zinc-900 rounded-[1.25rem] p-2 border border-border focus-within:border-teal/50 focus-within:ring-4 focus-within:ring-teal/5 transition-all">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your retirement plan, tax strategy, or risk profile..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-4 py-3 text-zinc-100 placeholder:text-zinc-600"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-teal text-white rounded-xl hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-center gap-4">
          <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Try:</p>
          <button 
            onClick={() => setInput("What if inflation hits 5%?")}
            className="text-[10px] text-teal hover:underline font-bold uppercase tracking-widest"
          >
            Inflation Stress Test
          </button>
          <button 
            onClick={() => setInput("How can I increase my readiness score?")}
            className="text-[10px] text-teal hover:underline font-bold uppercase tracking-widest"
          >
            Score Optimization
          </button>
        </div>
      </div>
    </div>
  );
}
