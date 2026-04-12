import { useState, useEffect, useCallback } from "react";
import { 
  LayoutDashboard, 
  History, 
  Sparkles, 
  TrendingUp, 
  Target, 
  Download, 
  Share2,
  Menu,
  X,
  ChevronRight,
  Zap,
  LogIn,
  LogOut,
  Save,
  Trash2,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { runSimulation, SimulationInput, SimulationResult } from "@/lib/monteCarlo";
import { ParameterControls } from "@/components/ParameterControls";
import { KPICards } from "@/components/KPICards";
import { ReadinessScore } from "@/components/ReadinessScore";
import { FanChart } from "@/components/FanChart";
import { AIAdvisor } from "@/components/AIAdvisor";
import { GeminiInsight } from "@/components/GeminiInsight";
import { MilestoneStrategy } from "@/components/MilestoneStrategy";
import { WealthLab } from "@/components/WealthLab";
import { DailyNudge } from "@/components/DailyNudge";
import { ReportTemplate } from "@/components/ReportTemplate";
import { cn, formatCurrency } from "@/lib/utils";
import { generatePDFReport } from "@/lib/pdfExport";
import { useAuth } from "@/lib/AuthContext";
import { db, collection, addDoc, query, where, orderBy, onSnapshot, doc, setDoc, deleteDoc, handleFirestoreError, OperationType } from "@/lib/firebase";

type Tab = 'simulator' | 'scenarios' | 'advisor' | 'milestones' | 'history' | 'wealth-lab';

export default function App() {
  const { user, loading, signIn, signOut } = useAuth();
  const [params, setParams] = useState<SimulationInput>({
    currentAge: 35,
    retirementAge: 65,
    lifeExpectancy: 95,
    currentSavings: 50000,
    annualIncome: 100000,
    monthlyContrib: 1500,
    retMonthly: 4000,
    riskProfile: 'moderate',
    taxableRatio: 0.4,
    rothRatio: 0.3,
    tradRatio: 0.3,
    useDynamicWithdrawal: true,
    inflationRate: 0.025,
  });

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('simulator');
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [simHistory, setSimHistory] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState("");
  const [lastRunTimestamp, setLastRunTimestamp] = useState<number>(0);

  const handleRun = useCallback(async () => {
    try {
      const response = await fetch('/api/simulation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const res = await response.json();
      setResult(res);
      setLastRunTimestamp(Date.now());
    } catch (error) {
      console.error("Simulation API Error:", error);
      const res = runSimulation(params);
      setResult(res);
      setLastRunTimestamp(Date.now());
    }
  }, [params]);

  useEffect(() => {
    if (isAutoRunning) {
      const timer = setTimeout(handleRun, 500);
      return () => clearTimeout(timer);
    }
  }, [params, isAutoRunning, handleRun]);

  // Listen to History and Scenarios
  useEffect(() => {
    if (!user) {
      setSimHistory([]);
      setScenarios([]);
      return;
    }

    const simsQuery = query(
      collection(db, 'users', user.uid, 'simulations'),
      orderBy('createdAt', 'desc')
    );
    const unsubSims = onSnapshot(simsQuery, (snapshot) => {
      setSimHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'simulations'));

    const scenariosQuery = query(
      collection(db, 'users', user.uid, 'scenarios'),
      orderBy('createdAt', 'desc')
    );
    const unsubScenarios = onSnapshot(scenariosQuery, (snapshot) => {
      setScenarios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'scenarios'));

    return () => {
      unsubSims();
      unsubScenarios();
    };
  }, [user]);

  const saveSimulation = async () => {
    if (!user || !result) return;
    setIsSaving(true);
    try {
      const path = `users/${user.uid}/simulations`;
      await addDoc(collection(db, path), {
        userId: user.uid,
        name: `Simulation ${new Date().toLocaleDateString()}`,
        params,
        metrics: {
          successRate: result.successRate,
          readinessScore: result.readinessScore,
          projectedAtRetirement: result.projectedAtRetirement
        },
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'simulations');
    } finally {
      setIsSaving(false);
    }
  };

  const saveAsScenario = async () => {
    if (!user || !result || !newScenarioName.trim()) return;

    try {
      const path = `users/${user.uid}/scenarios`;
      await addDoc(collection(db, path), {
        userId: user.uid,
        name: newScenarioName.trim(),
        params,
        metrics: {
          successRate: result.successRate,
          readinessScore: result.readinessScore,
          projectedAtRetirement: result.projectedAtRetirement
        },
        createdAt: new Date().toISOString()
      });
      setShowScenarioModal(false);
      setNewScenarioName("");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'scenarios');
    }
  };

  const deleteItem = async (type: 'simulations' | 'scenarios', id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, type, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, type);
    }
  };

  const loadSimulation = (item: any) => {
    setParams(item.params);
    setActiveTab('simulator');
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Capture the main simulation content
      await generatePDFReport('simulation-report', 'retirement-sim-report.pdf');
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'simulator', label: 'Simulator', icon: LayoutDashboard },
    { id: 'wealth-lab', label: 'Wealth Lab', icon: Zap },
    { id: 'advisor', label: 'AI Advisor', icon: Sparkles },
    { id: 'milestones', label: 'Milestones', icon: Target },
    { id: 'scenarios', label: 'Scenarios', icon: TrendingUp },
    { id: 'history', label: 'History', icon: History },
  ];

  if (loading) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Zap className="w-12 h-12 text-teal animate-pulse" />
          <div className="text-muted font-mono text-sm">Initializing PennyWise...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "bg-card border-r border-border transition-all duration-300 flex flex-col z-50",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center gap-3 border-b border-border shrink-0">
          <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center shadow-lg shadow-teal/20 shrink-0">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          {sidebarOpen && <span className="font-bold text-xl tracking-tight">PennyWise</span>}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                activeTab === tab.id 
                  ? "bg-teal/10 text-teal border border-teal/20" 
                  : "text-muted hover:bg-zinc-900 hover:text-zinc-100 border border-transparent"
              )}
            >
              <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-teal" : "text-muted group-hover:text-zinc-100")} />
              {sidebarOpen && <span className="font-medium">{tab.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-2 shrink-0">
          {user ? (
            <div className="space-y-2">
              {sidebarOpen && (
                <div className="flex items-center gap-3 px-2 mb-4">
                  <img src={user.photoURL || ""} alt="" className="w-8 h-8 rounded-full border border-border" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">{user.displayName}</div>
                    <div className="text-[10px] text-muted truncate">{user.email}</div>
                  </div>
                </div>
              )}
              <button 
                onClick={signOut}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-muted hover:text-red-400 hover:bg-red-400/5 transition-all"
              >
                <LogOut className="w-4 h-4" />
                {sidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
              </button>
            </div>
          ) : (
            <button 
              onClick={signIn}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-teal text-white font-bold shadow-lg shadow-teal/10 hover:bg-teal/90 transition-all"
            >
              <LogIn className="w-5 h-5" />
              {sidebarOpen && <span className="text-sm">Sign In</span>}
            </button>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 hover:bg-zinc-900 rounded-lg text-muted transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold capitalize">{activeTab}</h2>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-xs text-muted font-mono">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
              Live Simulation
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-amber/10 border border-amber/20 text-[10px] font-bold text-amber uppercase tracking-widest">
              DevFest Demo
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && result && activeTab === 'simulator' && (
              <>
                <button 
                  onClick={saveSimulation}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-border text-xs font-semibold hover:bg-zinc-800 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button 
                  onClick={() => setShowScenarioModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-border text-xs font-semibold hover:bg-zinc-800 transition-all"
                >
                  <TrendingUp className="w-4 h-4" />
                  As Scenario
                </button>
              </>
            )}
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-border text-xs font-semibold hover:bg-zinc-800 transition-all disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal text-white text-xs font-bold hover:bg-teal/90 transition-all shadow-lg shadow-teal/10">
              <Share2 className="w-4 h-4" />
              Share Plan
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              id="simulation-report" 
              className="space-y-8"
            >
              {activeTab === 'simulator' && (
                <div className="max-w-7xl mx-auto space-y-8">
                  <DailyNudge onClick={() => setActiveTab('advisor')} />
                  <GeminiInsight result={result} lastRunTimestamp={lastRunTimestamp} />
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <KPICards result={result} />
                    <div className="p-6 rounded-2xl glass border border-border">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Wealth Projection</h3>
                        <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-muted">
                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-teal" /> 90th</div>
                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber" /> Median</div>
                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red" /> 10th</div>
                        </div>
                      </div>
                      <FanChart result={result} />
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <ReadinessScore score={result?.readinessScore || 0} />
                    <ParameterControls 
                      params={params} 
                      setParams={setParams} 
                      isAutoRunning={isAutoRunning}
                      setIsAutoRunning={setIsAutoRunning}
                      onRun={handleRun}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'wealth-lab' && (
              <WealthLab 
                params={params} 
                result={result} 
                onUpdateParams={(newParams) => setParams(prev => ({ ...prev, ...newParams }))} 
              />
            )}

            {activeTab === 'advisor' && (
              <div className="max-w-4xl mx-auto">
                <AIAdvisor result={result} params={params} />
              </div>
            )}

            {activeTab === 'milestones' && (
              <div className="max-w-4xl mx-auto space-y-8 pb-20">
                {!result ? (
                  <div className="p-12 text-center glass rounded-[2.5rem] border-dashed">
                    <Target className="w-12 h-12 text-muted mx-auto mb-4 opacity-20" />
                    <h3 className="text-xl font-bold mb-2">Simulation Required</h3>
                    <p className="text-muted text-sm max-w-xs mx-auto mb-8">Run your simulation in the Simulator tab to generate your personalized financial roadmap.</p>
                    <button 
                      onClick={() => setActiveTab('simulator')}
                      className="px-6 py-3 bg-teal text-white rounded-xl font-bold hover:bg-teal/90 transition-all"
                    >
                      Go to Simulator
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">Financial Roadmap</h2>
                        <p className="text-muted text-sm">Your journey to financial independence, step by step.</p>
                      </div>
                      <div className="px-4 py-2 rounded-xl bg-teal/10 border border-teal/20 text-teal text-xs font-bold">
                        {result.readinessScore}% Ready
                      </div>
                    </div>

                    <div className="space-y-6">
                      {[
                        { label: "Emergency Fund (3 Months)", target: (Number(params.annualIncome || 0) / 12) * 3, icon: Zap, desc: "Safety net for unexpected expenses." },
                        { label: "First $100K Milestone", target: 100000, icon: Target, desc: "The hardest milestone in wealth building." },
                        { label: "Coast FIRE", target: result.requiredNestEgg * 0.4, icon: TrendingUp, desc: "No more contributions needed to retire at 65." },
                        { label: "Lean FIRE", target: result.requiredNestEgg * 0.7, icon: Sparkles, desc: "Basic expenses covered by investments." },
                        { label: "Financial Independence", target: result.requiredNestEgg, icon: Target, desc: "Your ultimate nest egg goal." },
                      ].map((milestone, i) => {
                        const path = result.pctPaths.p50;
                        const achievement = path.find(p => p.balance >= milestone.target);
                        const progress = Math.min(100, (params.currentSavings / milestone.target) * 100);
                        const isAchieved = params.currentSavings >= milestone.target;
                        
                        return (
                          <div key={i} className={cn(
                            "p-6 rounded-3xl glass border transition-all duration-500",
                            isAchieved ? "border-teal/30 bg-teal/5" : "border-border hover:border-zinc-700"
                          )}>
                            <div className="flex items-center gap-6">
                              <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-500",
                                isAchieved ? "bg-teal text-white border-teal shadow-lg shadow-teal/20" : "bg-zinc-900 border-border text-muted"
                              )}>
                                <milestone.icon className="w-7 h-7" />
                              </div>
                              <div className="flex-1 space-y-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-lg text-zinc-100">{milestone.label}</h4>
                                      {isAchieved && <div className="px-2 py-0.5 rounded-full bg-teal/20 text-teal text-[10px] font-bold uppercase">Achieved</div>}
                                    </div>
                                    <p className="text-xs text-muted">{milestone.desc}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs text-muted font-mono uppercase tracking-widest">Target</div>
                                    <div className="text-sm font-bold text-zinc-100">{formatCurrency(milestone.target)}</div>
                                    {achievement && !isAchieved && (
                                      <div className="text-[10px] text-teal font-bold mt-1">Est. Age {achievement.age}</div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="space-y-1.5">
                                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted">
                                    <span>Progress</span>
                                    <span>{progress.toFixed(0)}%</span>
                                  </div>
                                  <div className="h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-border/50 p-0.5">
                                    <div 
                                      className={cn(
                                        "h-full rounded-full transition-all duration-1000 ease-out",
                                        isAchieved ? "bg-teal" : "bg-zinc-700"
                                      )} 
                                      style={{ width: `${progress}%` }} 
                                    />
                                  </div>
                                </div>

                                {!isAchieved && (
                                  <MilestoneStrategy milestone={milestone} result={result} />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'scenarios' && (
              <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Saved Scenarios</h2>
                  <div className="text-xs text-muted uppercase tracking-widest font-mono">Compare your strategies</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {scenarios.length === 0 ? (
                    <div className="col-span-full py-20 text-center glass rounded-3xl border-dashed">
                      <TrendingUp className="w-12 h-12 text-muted mx-auto mb-4 opacity-20" />
                      <p className="text-muted">No scenarios saved yet. Save a simulation to compare strategies.</p>
                    </div>
                  ) : (
                    scenarios.map((scenario) => (
                      <div key={scenario.id} className="p-6 rounded-2xl glass border border-border space-y-4 group hover:border-teal/30 transition-all">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-lg">{scenario.name}</h4>
                          <button onClick={() => deleteItem('scenarios', scenario.id)} className="p-2 hover:bg-red-400/10 text-muted hover:text-red-400 rounded-lg transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-zinc-900 rounded-xl border border-border">
                            <div className="text-[10px] text-muted uppercase font-mono">Success</div>
                            <div className="text-lg font-bold text-teal">{scenario.metrics.successRate.toFixed(1)}%</div>
                          </div>
                          <div className="p-3 bg-zinc-900 rounded-xl border border-border">
                            <div className="text-[10px] text-muted uppercase font-mono">Readiness</div>
                            <div className="text-lg font-bold text-amber">{scenario.metrics.readinessScore}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => loadSimulation(scenario)}
                          className="w-full py-2 bg-zinc-900 border border-border rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all"
                        >
                          Load Scenario
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Simulation History</h2>
                  <div className="text-xs text-muted uppercase tracking-widest font-mono">Past iterations</div>
                </div>

                <div className="space-y-3">
                  {simHistory.length === 0 ? (
                    <div className="py-20 text-center glass rounded-3xl border-dashed">
                      <History className="w-12 h-12 text-muted mx-auto mb-4 opacity-20" />
                      <p className="text-muted">Your simulation history is empty.</p>
                    </div>
                  ) : (
                    simHistory.map((item) => (
                      <div key={item.id} className="p-4 rounded-xl glass border border-border flex items-center justify-between group hover:border-teal/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center border border-border">
                            <LayoutDashboard className="w-5 h-5 text-muted" />
                          </div>
                          <div>
                            <div className="font-bold text-sm">{item.name}</div>
                            <div className="text-[10px] text-muted font-mono">{new Date(item.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-right hidden md:block">
                            <div className="text-[10px] text-muted uppercase font-mono">Success Rate</div>
                            <div className="text-sm font-bold text-teal">{item.metrics.successRate.toFixed(1)}%</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => loadSimulation(item)}
                              className="px-4 py-2 bg-zinc-900 border border-border rounded-lg text-xs font-bold hover:bg-zinc-800 transition-all"
                            >
                              Load
                            </button>
                            <button 
                              onClick={() => deleteItem('simulations', item.id)}
                              className="p-2 hover:bg-red-400/10 text-muted hover:text-red-400 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Hidden Report Template for PDF Export */}
      <div className="fixed left-[-9999px] top-0">
        <ReportTemplate params={params} result={result} scenarios={scenarios} />
      </div>

      {/* Scenario Modal */}
        {showScenarioModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-card border border-border w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Save Scenario</h3>
                <button onClick={() => setShowScenarioModal(false)} className="p-2 hover:bg-zinc-900 rounded-lg text-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted uppercase tracking-widest mb-2 block">Scenario Name</label>
                  <input 
                    autoFocus
                    value={newScenarioName}
                    onChange={(e) => setNewScenarioName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveAsScenario()}
                    placeholder="e.g., Early Retirement Plan"
                    className="w-full bg-zinc-900 border border-border rounded-xl px-4 py-3 text-sm focus:border-teal/50 transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowScenarioModal(false)}
                    className="flex-1 py-3 bg-zinc-900 border border-border rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={saveAsScenario}
                    disabled={!newScenarioName.trim()}
                    className="flex-1 py-3 bg-teal text-white rounded-xl text-sm font-bold hover:bg-teal/90 transition-all disabled:opacity-50"
                  >
                    Save Scenario
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
