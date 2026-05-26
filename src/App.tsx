import { useState, useEffect, useCallback } from "react";
import { 
  IncomeOptimizer 
} from "./components/WealthLab";
import { 
  LayoutDashboard, 
  History, 
  Sparkles, 
  TrendingUp, 
  Download, 
  Share2,
  Menu,
  X,
  Zap,
  LogIn,
  LogOut,
  Save,
  Trash2,
  Loader2,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { runSimulation, SimulationInput, SimulationResult } from "@/lib/monteCarlo";
import { ParameterControls } from "@/components/ParameterControls";
import { KPICards } from "@/components/KPICards";
import { ReadinessScore } from "@/components/ReadinessScore";
import { FanChart } from "@/components/FanChart";
import { AIAdvisor } from "@/components/AIAdvisor";
import { GroqInsight } from "@/components/GroqInsight";
import { ReportTemplate } from "@/components/ReportTemplate";
import { cn, formatCurrency } from "@/lib/utils";
import { generatePDFReport } from "@/lib/pdfExport";
import { useAuth } from "@/lib/AuthContext";


type Tab = 'simulator' | 'scenarios' | 'advisor' | 'history' | 'income';

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
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [xp, setXp] = useState(1240);

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

  // Listen to History and Scenarios (local storage)
  useEffect(() => {
    if (!user) {
      setSimHistory([]);
      setScenarios([]);
      return;
    }

    const loadLocalData = () => {
      try {
        const storedSims = localStorage.getItem(`pennywise_${user.uid}_simulations`);
        if (storedSims) {
          setSimHistory(JSON.parse(storedSims));
        } else {
          setSimHistory([]);
        }

        const storedScenarios = localStorage.getItem(`pennywise_${user.uid}_scenarios`);
        if (storedScenarios) {
          setScenarios(JSON.parse(storedScenarios));
        } else {
          setScenarios([]);
        }
      } catch (err) {
        console.error("Failed to load local data:", err);
      }
    };

    loadLocalData();

    window.addEventListener('storage', loadLocalData);
    return () => window.removeEventListener('storage', loadLocalData);
  }, [user]);

  const saveSimulation = async () => {
    if (!user || !result) return;
    setIsSaving(true);
    try {
      const existing = localStorage.getItem(`pennywise_${user.uid}_simulations`);
      const list = existing ? JSON.parse(existing) : [];
      const newSim = {
        id: 'sim_' + Date.now().toString(36),
        userId: user.uid,
        name: `Simulation ${new Date().toLocaleDateString()}`,
        params,
        metrics: {
          successRate: result.successRate,
          readinessScore: result.readinessScore,
          projectedAtRetirement: result.projectedAtRetirement
        },
        createdAt: new Date().toISOString()
      };
      const updated = [newSim, ...list];
      localStorage.setItem(`pennywise_${user.uid}_simulations`, JSON.stringify(updated));
      setSimHistory(updated);
    } catch (err) {
      console.error("Local Save Simulation Error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const saveAsScenario = async () => {
    if (!user || !result || !newScenarioName.trim()) return;

    try {
      const existing = localStorage.getItem(`pennywise_${user.uid}_scenarios`);
      const list = existing ? JSON.parse(existing) : [];
      const newScenario = {
        id: 'scen_' + Date.now().toString(36),
        userId: user.uid,
        name: newScenarioName.trim(),
        params,
        metrics: {
          successRate: result.successRate,
          readinessScore: result.readinessScore,
          projectedAtRetirement: result.projectedAtRetirement
        },
        createdAt: new Date().toISOString()
      };
      const updated = [newScenario, ...list];
      localStorage.setItem(`pennywise_${user.uid}_scenarios`, JSON.stringify(updated));
      setScenarios(updated);
      setShowScenarioModal(false);
      setNewScenarioName("");
    } catch (err) {
      console.error("Local Save Scenario Error:", err);
    }
  };

  const deleteItem = async (type: 'simulations' | 'scenarios', id: string) => {
    if (!user) return;
    try {
      const storageKey = `pennywise_${user.uid}_${type}`;
      const existing = localStorage.getItem(storageKey);
      if (existing) {
        const list = JSON.parse(existing);
        const updated = list.filter((item: any) => item.id !== id);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        if (type === 'simulations') {
          setSimHistory(updated);
        } else {
          setScenarios(updated);
        }
      }
    } catch (err) {
      console.error("Local Delete Item Error:", err);
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
    { id: 'income', label: 'Income Growth', icon: Briefcase },
    { id: 'advisor', label: 'AI Advisor', icon: Sparkles },
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
        "bg-card border-r border-border transition-all duration-300 flex flex-col z-50 no-print",
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
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-8 shrink-0 no-print">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold capitalize">{activeTab}</h2>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-xs text-muted font-mono">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
              Live Simulation
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
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-border text-xs font-semibold hover:bg-zinc-800 transition-all disabled:opacity-50 no-print"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal text-white text-xs font-bold hover:bg-teal/90 transition-all shadow-lg shadow-teal/10 no-print">
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
                  <GroqInsight result={result} lastRunTimestamp={lastRunTimestamp} onInsightGenerated={setAiInsight} />
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
                    
                    <div className="space-y-8 no-print">
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

              {activeTab === 'income' && (
                <IncomeOptimizer params={params} result={result} />
              )}

              {activeTab === 'advisor' && (
                <div className="max-w-4xl mx-auto">
                  <AIAdvisor result={result} params={params} />
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
        <ReportTemplate params={params} result={result} scenarios={scenarios} aiInsight={aiInsight} />
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
