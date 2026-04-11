import { useState, useEffect } from "react";
import { 
  Zap, 
  TrendingUp, 
  ShieldAlert, 
  Flame, 
  Target, 
  Briefcase, 
  DollarSign, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Trophy,
  Users,
  X,
  Loader2,
  Link as LinkIcon,
  CreditCard,
  Building2,
  RefreshCw,
  BellRing
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SimulationInput, SimulationResult } from "@/lib/monteCarlo";
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";

interface WealthLabProps {
  params: SimulationInput;
  result: SimulationResult | null;
  onUpdateParams?: (newParams: Partial<SimulationInput>) => void;
}

export function WealthLab({ params, result, onUpdateParams }: WealthLabProps) {
  const [activeTool, setActiveTool] = useState<'nudges' | 'income' | 'debt' | 'expenses' | 'link'>('nudges');
  const [xp, setXp] = useState(1240);
  const [level, setLevel] = useState(12);

  const tools = [
    { id: 'nudges', label: 'Nudge Engine', icon: Zap, color: 'text-teal', bg: 'bg-teal/10' },
    { id: 'income', label: 'Income Growth', icon: TrendingUp, color: 'text-amber', bg: 'bg-amber/10' },
    { id: 'link', label: 'Bank Link', icon: LinkIcon, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'debt', label: 'Debt Accelerator', icon: Flame, color: 'text-red', bg: 'bg-red/10' },
    { id: 'expenses', label: 'Expense Audit', icon: ShieldAlert, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-teal/10 border border-teal/20 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-teal" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-teal text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg">
              LVL {level}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Wealth Lab</h2>
            <div className="flex items-center gap-3 mt-1">
              <div className="h-1.5 w-32 bg-zinc-800 rounded-full overflow-hidden border border-border">
                <div className="h-full bg-teal transition-all duration-500" style={{ width: `${(xp % 1000) / 10}%` }} />
              </div>
              <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{xp} Total XP</span>
            </div>
          </div>
        </div>
        <div className="flex p-1 bg-zinc-900 rounded-2xl border border-border overflow-x-auto">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0",
                activeTool === tool.id 
                  ? "bg-card text-zinc-100 shadow-lg border border-border" 
                  : "text-muted hover:text-zinc-300"
              )}
            >
              <tool.icon className={cn("w-4 h-4", activeTool === tool.id ? tool.color : "text-muted")} />
              <span className="hidden sm:inline">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTool}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {activeTool === 'nudges' && <NudgeEngine params={params} result={result} onXpGain={(amt) => setXp(prev => prev + amt)} onUpdateParams={onUpdateParams} />}
            {activeTool === 'income' && <IncomeOptimizer params={params} result={result} />}
            {activeTool === 'link' && <BankLink params={params} onUpdateParams={onUpdateParams} onXpGain={(amt) => setXp(prev => prev + amt)} />}
            {activeTool === 'debt' && <DebtAccelerator params={params} result={result} />}
            {activeTool === 'expenses' && <ExpenseOptimizer params={params} result={result} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

interface NudgeEngineProps extends WealthLabProps {
  onXpGain: (amt: number) => void;
}

function NudgeEngine({ params, result, onXpGain, onUpdateParams }: NudgeEngineProps) {
  const [showProofModal, setShowProofModal] = useState<string | null>(null);
  const [proofText, setProofText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);
  const [transactionMessage, setTransactionMessage] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [liveNudges, setLiveNudges] = useState<any[]>([]);
  const [autoDetectEnabled, setAutoDetectEnabled] = useState(true);

  // Simulate "Auto-Detect" from background
  useEffect(() => {
    if (!autoDetectEnabled) return;
    
    const interval = setInterval(() => {
      // 5% chance of a simulated "Auto-detected" notification
      if (Math.random() < 0.05) {
        const mockNotifications = [
          "Paid $12.50 at Whole Foods",
          "Salary of $4,500 deposited",
          "Subscription for Netflix $15.99 charged",
          "Paid $45.00 at Shell Gas Station"
        ];
        const msg = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
        setTransactionMessage(msg);
        // We'll let the user see it in the box first or auto-parse
        // For demo, let's just trigger a "New Notification" alert
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [autoDetectEnabled]);

  const habits = [
    { id: 'spending', label: "Log daily spending", xp: 20 },
    { id: 'velocity', label: "Review savings velocity", xp: 15 },
    { id: 'benchmark', label: "Check peer benchmark", xp: 10 },
    { id: 'budget', label: "On-budget spending", xp: 30 }
  ];

  const handleParseTransaction = async () => {
    if (!transactionMessage.trim()) return;
    setIsParsing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const prompt = `
        Analyze this bank transaction message and provide a financial nudge:
        Message: "${transactionMessage}"
        
        Current User Context:
        - Monthly Budget: $${(params.annualIncome / 12).toFixed(0)}
        - Savings Goal: 20%
        
        Return a JSON object with:
        {
          "type": "warning" | "celebration" | "insight",
          "message": "Short catchy nudge message",
          "impact": "Projected wealth impact if this habit continues",
          "category": "Food/Product/Service",
          "amount": number,
          "habitToComplete": "spending" | "budget" | null,
          "isSalary": boolean
        }
      `;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      
      const text = response.text || "{}";
      const cleaned = text.replace(/```json|```/g, "").trim();
      const data = JSON.parse(cleaned);
      
      const newNudge = {
        ...data,
        icon: data.isSalary ? DollarSign : (data.type === 'warning' ? ShieldAlert : data.type === 'celebration' ? Trophy : Target),
        color: data.isSalary ? 'text-teal' : (data.type === 'warning' ? 'text-red' : data.type === 'celebration' ? 'text-teal' : 'text-amber')
      };
      
      setLiveNudges(prev => [newNudge, ...prev]);
      onXpGain(25); 

      // Automatically complete habit if AI detects it
      if (data.habitToComplete && !completedHabits.includes(data.habitToComplete)) {
        setCompletedHabits(prev => [...prev, data.habitToComplete]);
        const habit = habits.find(h => h.id === data.habitToComplete);
        if (habit) onXpGain(habit.xp);
      }

      // Auto-update params if salary detected
      if (data.isSalary && data.amount && onUpdateParams) {
        onUpdateParams({ annualIncome: data.amount * 12 });
      }

      setTransactionMessage("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleLogHabit = (habitId: string) => {
    if (completedHabits.includes(habitId)) return;
    setShowProofModal(habitId);
  };

  const submitProof = async () => {
    if (!proofText.trim()) return;
    setIsSubmitting(true);
    // Simulate verification
    await new Promise(r => setTimeout(r, 1500));
    
    const habit = habits.find(h => h.id === showProofModal);
    if (habit) {
      onXpGain(habit.xp);
      setCompletedHabits(prev => [...prev, habit.id]);
    }
    
    setIsSubmitting(false);
    setShowProofModal(null);
    setProofText("");
  };

  const nudges = [
    { 
      type: 'celebration', 
      message: "Your net worth crossed a new milestone! You're in the top 15% for your age group.", 
      impact: "Financial Freedom +2 years",
      icon: Trophy,
      color: 'text-teal'
    },
    { 
      type: 'opportunity', 
      message: "Switching your savings to a High-Yield account could add $450/year in passive income.", 
      icon: TrendingUp,
      color: 'text-amber'
    },
    { 
      type: 'warning', 
      message: "High expense ratio detected on your 401k funds. Switching could save $85k over 30 years.", 
      icon: ShieldAlert,
      color: 'text-red'
    },
    { 
      type: 'insight', 
      message: "Based on your current trajectory, you could reach 'Lean FIRE' by age 52.", 
      icon: Sparkles,
      color: 'text-blue-400'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-3xl glass border border-border space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Daily Micro-Habits</h3>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 border border-teal/20 text-teal text-[10px] font-bold uppercase tracking-widest">
              <Flame className="w-3 h-3" /> 12 Day Streak
            </div>
          </div>
          
          <div className="space-y-4">
            {habits.map((habit) => (
              <div key={habit.id} className={cn(
                "flex items-center justify-between p-4 rounded-2xl border transition-all",
                completedHabits.includes(habit.id) 
                  ? "bg-teal/5 border-teal/20" 
                  : "bg-zinc-900/50 border-border/50 group hover:border-teal/30"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center border",
                    completedHabits.includes(habit.id) ? "bg-teal/10 border-teal/20" : "bg-zinc-800 border-border"
                  )}>
                    {completedHabits.includes(habit.id) ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                    )}
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    completedHabits.includes(habit.id) ? "text-teal" : "text-zinc-300"
                  )}>{habit.label}</span>
                </div>
                {completedHabits.includes(habit.id) ? (
                  <div className="text-[10px] font-bold text-teal uppercase tracking-widest">Completed</div>
                ) : (
                  <button 
                    onClick={() => handleLogHabit(habit.id)}
                    className="text-[10px] font-bold text-teal uppercase tracking-widest hover:underline"
                  >
                    Log +{habit.xp} XP
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Proof Modal */}
        {showProofModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-card border border-border w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Provide Proof</h3>
                <button onClick={() => setShowProofModal(null)} className="p-2 hover:bg-zinc-900 rounded-lg text-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-muted">
                  To earn XP for <span className="text-zinc-200 font-bold">"{habits.find(h => h.id === showProofModal)?.label}"</span>, 
                  please describe what you did or upload a screenshot.
                </p>
                <textarea 
                  autoFocus
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder="e.g., Logged my $12 lunch expense in my tracker..."
                  className="w-full h-32 bg-zinc-900 border border-border rounded-xl px-4 py-3 text-sm focus:border-teal/50 transition-all resize-none"
                />
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowProofModal(null)}
                    className="flex-1 py-3 bg-zinc-900 border border-border rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={submitProof}
                    disabled={!proofText.trim() || isSubmitting}
                    className="flex-1 py-3 bg-teal text-white rounded-xl text-sm font-bold hover:bg-teal/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Submit Proof
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-teal flex items-center gap-2">
                <Zap className="w-4 h-4" /> Transaction Catcher
              </h3>
              <button 
                onClick={() => setAutoDetectEnabled(!autoDetectEnabled)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all",
                  autoDetectEnabled ? "bg-teal/10 border-teal/20 text-teal" : "bg-zinc-800 border-border text-muted"
                )}
              >
                <BellRing className="w-3 h-3" />
                {autoDetectEnabled ? "Auto-Detect ON" : "Auto-Detect OFF"}
              </button>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Paste a bank SMS, email notification, or mobile alert. Our AI will automatically categorize it as Food, Product, or Service and update your simulation.
            </p>
            <div className="relative">
              <textarea 
                value={transactionMessage}
                onChange={(e) => setTransactionMessage(e.target.value)}
                placeholder="e.g. Paid $45.20 at Starbucks... or Salary of $5000 deposited..."
                className="w-full h-24 bg-zinc-900 border border-border rounded-xl px-4 py-3 text-sm focus:border-teal/50 transition-all resize-none"
              />
              <button 
                onClick={handleParseTransaction}
                disabled={isParsing || !transactionMessage.trim()}
                className="absolute bottom-3 right-3 p-2 bg-teal text-white rounded-lg hover:bg-teal/90 disabled:opacity-50 transition-all"
              >
                {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <h3 className="text-sm font-bold uppercase tracking-widest text-muted px-2">Smart Notifications</h3>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {liveNudges.map((nudge, i) => (
                <motion.div 
                  key={`live-${i}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-5 rounded-3xl bg-teal/5 border border-teal/20 flex items-start gap-4 shadow-sm"
                >
                  <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border bg-teal/10 border-teal/20")}>
                    <nudge.icon className={cn("w-5 h-5", nudge.color)} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-zinc-200 font-bold leading-relaxed">{nudge.message}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal/20 text-teal font-bold uppercase">Live</span>
                    </div>
                    {nudge.impact && (
                      <p className="text-[10px] font-bold text-teal uppercase tracking-widest">Impact: {nudge.impact}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {nudges.map((nudge, i) => (
              <div key={i} className="p-5 rounded-3xl glass border border-border flex items-start gap-4 hover:bg-zinc-900/50 transition-all">
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border", nudge.color.replace('text-', 'bg-').replace('text-', 'border-') + '/10 border-' + nudge.color.split('-')[1] + '/20')}>
                  <nudge.icon className={cn("w-5 h-5", nudge.color)} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-zinc-200 leading-relaxed">{nudge.message}</p>
                  {nudge.impact && (
                    <p className="text-[10px] font-bold text-teal uppercase tracking-widest">Impact: {nudge.impact}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function IncomeOptimizer({ params, result }: WealthLabProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [resumeText, setResumeText] = useState("");

  const runAnalysis = async (specificSection?: string) => {
    if (!resumeText.trim()) {
      alert("Please paste your resume first for a personalized analysis.");
      return;
    }
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const prompt = `
        As a world-class career strategist and income growth expert, analyze this user's resume for maximum wealth multiplication:
        
        RESUME CONTENT:
        "${resumeText}"
        
        USER CONTEXT:
        - Current Income: $${params.annualIncome.toLocaleString()}
        - Age: ${params.currentAge}
        
        Provide a deep, actionable analysis. 
        IMPORTANT: Return ONLY a JSON object with this structure:
        {
          "title": "Professional Growth Strategy",
          "summary": "High-level summary of their potential",
          "sections": [
            {
              "id": "roadmap",
              "title": "Industry Leader Roadmap",
              "content": "Master specific high-level skills...",
              "steps": ["Step 1...", "Step 2..."],
              "impact": "Potential 30% salary increase"
            },
            {
              "id": "gaps",
              "title": "Skill Gap Analysis",
              "content": "Master these 3 critical skills...",
              "steps": ["Skill A...", "Skill B..."],
              "impact": "Market demand is up 40% for these"
            },
            {
              "id": "hustles",
              "title": "Career-Aligned Side Hustles",
              "content": "Leverage your expertise in...",
              "steps": ["Hustle 1...", "Hustle 2..."],
              "impact": "+$2k/mo potential"
            },
            {
              "id": "multiplier",
              "title": "Income Multiplier Strategy",
              "content": "Plan to increase primary income...",
              "steps": ["Action 1...", "Action 2..."],
              "impact": "25-50% growth in 24 months"
            }
          ]
        }
        
        ${specificSection ? `ONLY return the section with id: "${specificSection}" inside the sections array.` : ""}
      `;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      
      const text = response.text || "{}";
      const cleaned = text.replace(/```json|```/g, "").trim();
      const data = JSON.parse(cleaned);
      setAnalysis(data);
    } catch (err) {
      console.error(err);
      alert("Error running analysis. Please ensure your resume text is valid.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="p-8 rounded-3xl glass border border-border bg-gradient-to-br from-amber/5 to-transparent space-y-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-16 h-16 rounded-2xl bg-amber/10 border border-amber/20 flex items-center justify-center shrink-0">
            <Briefcase className="w-8 h-8 text-amber" />
          </div>
          <div className="flex-1 space-y-4">
            <h3 className="text-2xl font-bold">Income Growth Optimizer</h3>
            <p className="text-muted text-sm max-w-2xl leading-relaxed">
              Increasing income is 2-3x more effective than cutting expenses. Paste your resume below for a deep AI analysis of your career trajectory and earning potential.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-widest text-muted">Paste Resume / Profile Text</label>
            {resumeText && (
              <button onClick={() => setResumeText("")} className="text-[10px] text-red hover:underline font-bold uppercase">Clear</button>
            )}
          </div>
          <textarea 
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume, LinkedIn profile text, or job description here..."
            className="w-full h-48 bg-zinc-900 border border-border rounded-2xl px-6 py-4 text-sm focus:border-amber/50 transition-all resize-none shadow-inner"
          />
          <button 
            onClick={() => runAnalysis()}
            disabled={isAnalyzing || !resumeText.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-amber text-black rounded-xl font-bold hover:bg-amber/90 transition-all disabled:opacity-50 shadow-lg shadow-amber/10"
          >
            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Analyze Resume & Unlock Growth Roadmap
          </button>
        </div>

        {analysis && (
          <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-6 rounded-2xl bg-amber/5 border border-amber/20">
              <h4 className="text-amber font-bold text-lg mb-2">{analysis.title}</h4>
              <p className="text-sm text-zinc-300 leading-relaxed">{analysis.summary}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysis.sections?.map((section: any, i: number) => (
                <div key={i} className="p-6 rounded-3xl glass border border-border hover:border-amber/30 transition-all space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-zinc-100">{section.title}</h5>
                    <div className="px-2 py-1 rounded bg-amber/10 border border-amber/20 text-[10px] font-bold text-amber uppercase tracking-widest">
                      {section.impact}
                    </div>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">{section.content}</p>
                  <div className="space-y-2">
                    {section.steps?.map((step: string, j: number) => (
                      <div key={j} className="flex items-start gap-2 text-xs text-zinc-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber mt-1.5 shrink-0" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { id: 'roadmap', label: "Salary Progression", desc: "ROI on certifications & job switches", icon: TrendingUp },
          { id: 'hustles', label: "Side Hustles", desc: "Skills-based passive income potential", icon: DollarSign },
          { id: 'gaps', label: "Skill Gap", desc: "High-paying skills in your field", icon: Target },
        ].map((item, i) => (
          <button 
            key={i} 
            onClick={() => runAnalysis(item.id)}
            disabled={isAnalyzing || !resumeText.trim()}
            className="p-6 rounded-3xl glass border border-border hover:border-amber/30 transition-all text-left group disabled:opacity-50"
          >
            <item.icon className="w-6 h-6 text-amber mb-4 group-hover:scale-110 transition-transform" />
            <h4 className="font-bold mb-1">{item.label}</h4>
            <p className="text-xs text-muted mb-4">{item.desc}</p>
            <div className="flex items-center gap-2 text-[10px] font-bold text-amber uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
              Run Deep Analysis <ArrowRight className="w-3 h-3" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function BankLink({ params, onUpdateParams, onXpGain }: { params: SimulationInput, onUpdateParams?: (p: Partial<SimulationInput>) => void, onXpGain: (a: number) => void }) {
  const [isLinking, setIsLinking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleLink = async () => {
    setIsLinking(true);
    // Simulate Plaid Link flow
    await new Promise(r => setTimeout(r, 2000));
    if (onUpdateParams) {
      onUpdateParams({
        isLinked: true,
        linkedBankBalance: 12450.80,
        linkedMonthlyIncome: 5200,
        linkedMonthlySpending: 3100,
        lastSyncDate: new Date().toISOString()
      });
      onXpGain(100); // Big XP for linking
    }
    setIsLinking(false);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 1500));
    if (onUpdateParams) {
      onUpdateParams({
        lastSyncDate: new Date().toISOString(),
        linkedBankBalance: (params.linkedBankBalance || 0) + (Math.random() * 100 - 50)
      });
    }
    setIsSyncing(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="p-8 rounded-[2rem] glass border border-border bg-gradient-to-br from-blue-400/5 to-transparent space-y-8 relative overflow-hidden">
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-blue-400/10 border border-blue-400/20 flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">DevFest Demo Mode</span>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-16 h-16 rounded-2xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center shrink-0">
            <Building2 className="w-8 h-8 text-blue-400" />
          </div>
          <div className="flex-1 space-y-4">
            <h3 className="text-2xl font-bold">Bank & Card Integration</h3>
            <p className="text-muted text-sm max-w-2xl leading-relaxed">
              Securely link your bank accounts and credit cards via Plaid. Our AI will auto-detect salary deposits, recurring bills, and daily spending to keep your retirement plan 100% accurate.
            </p>
          </div>
        </div>

        {!params.isLinked ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 rounded-3xl bg-zinc-900/50 border-2 border-dashed border-border flex flex-col items-center text-center space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-blue-400/5 flex items-center justify-center">
              <CreditCard className="w-10 h-10 text-blue-400/40" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold">No Accounts Linked</h4>
              <p className="text-sm text-muted max-w-xs mx-auto">Link your accounts to enable auto-detection of payments and salary updates.</p>
            </div>
            <button 
              onClick={handleLink}
              disabled={isLinking}
              className="px-8 py-4 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              {isLinking ? <Loader2 className="w-5 h-5 animate-spin" /> : <LinkIcon className="w-5 h-5" />}
              Connect with Plaid
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-zinc-900 border border-border space-y-1">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Linked Balance</p>
                <p className="text-2xl font-bold text-blue-400">${params.linkedBankBalance?.toLocaleString()}</p>
              </div>
              <div className="p-6 rounded-2xl bg-zinc-900 border border-border space-y-1">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Avg. Monthly Income</p>
                <p className="text-2xl font-bold text-teal">${params.linkedMonthlyIncome?.toLocaleString()}</p>
              </div>
              <div className="p-6 rounded-2xl bg-zinc-900 border border-border space-y-1">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Avg. Monthly Spend</p>
                <p className="text-2xl font-bold text-red">${params.linkedMonthlySpending?.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-400/5 border border-blue-400/20">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                <p className="text-xs text-zinc-300">
                  Last synced: <span className="font-bold">{new Date(params.lastSyncDate || "").toLocaleTimeString()}</span>
                </p>
              </div>
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:underline"
              >
                {isSyncing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Sync Now
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-border space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-widest text-muted">Auto-Detected Insights</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-teal/5 border border-teal/20">
                  <CheckCircle2 className="w-4 h-4 text-teal mt-0.5" />
                  <p className="text-xs text-zinc-300">Salary deposit of $5,200 detected. Simulation updated.</p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-amber/5 border border-amber/20">
                  <Zap className="w-4 h-4 text-amber mt-0.5" />
                  <p className="text-xs text-zinc-300">Recurring subscription "Netflix" detected ($15.99). Added to Expense Audit.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function DebtAccelerator({ params, result }: WealthLabProps) {
  const [debtAmount, setDebtAmount] = useState(25000);
  const [interestRate, setInterestRate] = useState(18);
  const [monthlyPayment, setMonthlyPayment] = useState(800);
  const [activeStrategy, setActiveStrategy] = useState<string | null>(null);
  const [enabledAutomations, setEnabledAutomations] = useState<string[]>([]);

  const handleApplyStrategy = (strategy: string) => {
    setActiveStrategy(strategy);
  };

  const toggleAutomation = (id: string) => {
    setEnabledAutomations(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const monthsToPayoff = Math.ceil(debtAmount / (monthlyPayment - (debtAmount * (interestRate / 100 / 12))));
  const totalInterest = (monthlyPayment * monthsToPayoff) - debtAmount;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 p-8 rounded-3xl glass border border-border space-y-6">
          <h3 className="text-xl font-bold">Debt Profile</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Total Debt</label>
              <input 
                type="number" 
                value={debtAmount} 
                onChange={(e) => setDebtAmount(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-border rounded-xl px-4 py-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Interest Rate (%)</label>
              <input 
                type="number" 
                value={interestRate} 
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-border rounded-xl px-4 py-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest">Monthly Payment</label>
              <input 
                type="number" 
                value={monthlyPayment} 
                onChange={(e) => setMonthlyPayment(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-border rounded-xl px-4 py-3 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-red/5 border border-red/20 space-y-2">
              <p className="text-xs font-bold text-red/60 uppercase tracking-widest">Time to Debt Free</p>
              <p className="text-4xl font-bold text-red">{monthsToPayoff} <span className="text-lg">Months</span></p>
            </div>
            <div className="p-6 rounded-3xl bg-amber/5 border border-amber/20 space-y-2">
              <p className="text-xs font-bold text-amber/60 uppercase tracking-widest">Total Interest Paid</p>
              <p className="text-4xl font-bold text-amber">${totalInterest.toLocaleString()}</p>
            </div>
          </div>

          <div className="p-8 rounded-3xl glass border border-border">
            <h3 className="text-lg font-bold mb-6">Psychological Wins Accelerator</h3>
            <div className="space-y-4">
              <div className={cn(
                "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                activeStrategy === 'avalanche' ? "bg-teal/5 border-teal/20" : "bg-zinc-900/50 border-border"
              )}>
                <div className="w-10 h-10 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-teal" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Avalanche Strategy</p>
                  <p className="text-xs text-muted">Prioritizing high interest saves you $4,200 more than Snowball.</p>
                </div>
                <button 
                  onClick={() => handleApplyStrategy('avalanche')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                    activeStrategy === 'avalanche' ? "bg-teal text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  )}
                >
                  {activeStrategy === 'avalanche' ? 'Active' : 'Apply'}
                </button>
              </div>
              <div className={cn(
                "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                enabledAutomations.includes('roundup') ? "bg-amber/5 border-amber/20" : "bg-zinc-900/50 border-border"
              )}>
                <div className="w-10 h-10 rounded-xl bg-amber/10 border border-amber/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Round-up Automation</p>
                  <p className="text-xs text-muted">Round up every purchase to pay off debt 4 months faster.</p>
                </div>
                <button 
                  onClick={() => toggleAutomation('roundup')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                    enabledAutomations.includes('roundup') ? "bg-amber text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  )}
                >
                  {enabledAutomations.includes('roundup') ? 'Enabled' : 'Enable'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExpenseOptimizer({ params, result }: WealthLabProps) {
  const [isAuditing, setIsAuditing] = useState(false);
  const [audit, setAudit] = useState<string | null>(null);

  const runAudit = async () => {
    setIsAuditing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const prompt = `
        As an expense optimization expert and AI negotiation assistant, audit these potential expenses:
        - Monthly Income: $${(params.annualIncome / 12).toLocaleString()}
        - Monthly Contribution: $${params.monthlyContrib.toLocaleString()}
        
        Provide:
        1. **Subscription Audit**: Identify likely unused or redundant subscriptions for this income level.
        2. **Bill Negotiation Scripts**: Provide a short script to negotiate an internet or insurance bill.
        3. **Spending Pattern Analysis**: Suggest 3 specific "waste categories" to audit.
        
        Format with professional markdown.
      `;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      setAudit(response.text || "Audit unavailable.");
    } catch (err: any) {
      console.error(err);
      let msg = "Error running audit.";
      if (err?.message?.includes('quota') || err?.message?.includes('429')) {
        msg = "AI Audit is currently at capacity (Quota Exceeded). Please try again later or provide your own API key.";
      }
      setAudit(msg);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="p-8 rounded-[2rem] glass border border-border bg-gradient-to-br from-blue-400/5 to-transparent relative overflow-hidden">
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-blue-400/10 border border-blue-400/20 flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">DevFest Demo Mode</span>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-16 h-16 rounded-2xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-8 h-8 text-blue-400" />
          </div>
          <div className="flex-1 space-y-4">
            <h3 className="text-2xl font-bold">Expense Optimization Engine</h3>
            <p className="text-muted text-sm max-w-2xl leading-relaxed">
              The average person wastes $3K-$8K annually on recurring subscriptions and inflated bills. Our AI Negotiation Assistant helps you claw that money back.
            </p>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={runAudit}
                disabled={isAuditing}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
              >
                {isAuditing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {isAuditing ? 'Analyzing Expenses...' : 'Start AI Subscription Audit'}
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-border text-zinc-300 rounded-xl font-bold hover:bg-zinc-800 transition-all">
                <Briefcase className="w-4 h-4" />
                Negotiate Bills
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {audit && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-8 rounded-3xl bg-zinc-900/80 border border-border backdrop-blur-md relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-blue-400/10 transition-all duration-1000" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h4 className="font-bold text-lg text-blue-400 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" /> AI Audit Results
                  </h4>
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Analysis Complete</span>
                </div>
                <div className="text-zinc-300 space-y-4 text-sm leading-relaxed">
                  {audit.split('\n').map((line, i) => (
                    <p key={i} className={cn(
                      line.startsWith('#') ? "text-lg font-bold text-zinc-100 pt-2" : "",
                      line.startsWith('-') ? "pl-4 border-l-2 border-blue-400/30" : ""
                    )}>{line.replace(/^#+\s*/, '').replace(/^-\s*/, '')}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl glass border border-border space-y-4">
          <h4 className="font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal" /> Potential Savings
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subscription Cleanup</span>
              <span className="text-teal font-bold">$1,200/yr</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Bill Negotiation</span>
              <span className="text-teal font-bold">$850/yr</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Smart Shopping</span>
              <span className="text-teal font-bold">$2,100/yr</span>
            </div>
          </div>
        </div>
        <div className="p-6 rounded-3xl glass border border-border space-y-4">
          <h4 className="font-bold flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber" /> Opportunity Alerts
          </h4>
          <div className="space-y-2">
            <p className="text-xs text-muted">"Your car insurance is 22% above market average. We'll negotiate with your provider."</p>
            <p className="text-xs text-muted">"Switch to a cheaper internet plan: Same speed, $30/month less."</p>
          </div>
        </div>
      </div>
    </div>
  );
}
