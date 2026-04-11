import { SimulationInput } from "@/lib/monteCarlo";

interface ParameterControlsProps {
  params: SimulationInput;
  setParams: (params: SimulationInput) => void;
  isAutoRunning: boolean;
  setIsAutoRunning: (val: boolean) => void;
  onRun: () => void;
}

export function ParameterControls({ params, setParams, isAutoRunning, setIsAutoRunning, onRun }: ParameterControlsProps) {
  const handleChange = (key: keyof SimulationInput, value: any) => {
    setParams({ ...params, [key]: value });
  };

  const sliders = [
    { label: "Current Age", key: "currentAge", min: 18, max: 70, step: 1, suffix: "" },
    { label: "Retirement Age", key: "retirementAge", min: params.currentAge + 1, max: 85, step: 1, suffix: "" },
    { label: "Life Expectancy", key: "lifeExpectancy", min: params.retirementAge + 1, max: 120, step: 1, suffix: "" },
    { label: "Current Savings", key: "currentSavings", min: 0, max: 2000000, step: 10000, prefix: "$" },
    { label: "Annual Income", key: "annualIncome", min: 20000, max: 1000000, step: 5000, prefix: "$" },
    { label: "Monthly Contribution", key: "monthlyContrib", min: 0, max: 20000, step: 100, prefix: "$" },
    { label: "Retirement Monthly", key: "retMonthly", min: 1000, max: 50000, step: 500, prefix: "$" },
  ];

  return (
    <div className="p-6 rounded-2xl glass space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Simulation Parameters</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-medium">Auto-run</span>
          <button 
            onClick={() => setIsAutoRunning(!isAutoRunning)}
            className={`w-10 h-5 rounded-full transition-colors relative ${isAutoRunning ? 'bg-teal' : 'bg-zinc-800'}`}
          >
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isAutoRunning ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
        {sliders.map((slider) => (
          <div key={slider.key} className="space-y-3">
            <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-muted">
              <span>{slider.label}</span>
              <span className="text-zinc-100">
                {slider.prefix}{params[slider.key as keyof SimulationInput].toLocaleString()}{slider.suffix}
              </span>
            </div>
            <input 
              type="range"
              min={slider.min}
              max={slider.max}
              step={slider.step}
              value={params[slider.key as keyof SimulationInput] as number}
              onChange={(e) => handleChange(slider.key as keyof SimulationInput, Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        ))}
        
        <div className="space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-muted">Risk Profile</div>
          <div className="flex gap-2">
            {['conservative', 'moderate', 'aggressive'].map((profile) => (
              <button
                key={profile}
                onClick={() => handleChange('riskProfile', profile)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all border ${
                  params.riskProfile === profile 
                    ? 'bg-teal border-teal text-white shadow-lg shadow-teal/20' 
                    : 'bg-zinc-900 border-border text-zinc-400 hover:border-zinc-700'
                }`}
              >
                {profile}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Strategies Section */}
      <div className="pt-6 border-t border-border/50">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-4 bg-teal rounded-full" />
          <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-300">Advanced Strategies</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tax Aware Buckets */}
          <div className="space-y-4 p-5 rounded-2xl bg-zinc-900/30 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Tax-Aware Buckets</span>
              <div className="text-[10px] px-2 py-0.5 rounded-full bg-teal/10 text-teal font-bold uppercase">Optimized</div>
            </div>
            <div className="space-y-4">
              {[
                { label: "Taxable (Brokerage)", key: "taxableRatio" },
                { label: "Roth (Tax-Free)", key: "rothRatio" },
                { label: "Traditional (Pre-Tax)", key: "tradRatio" },
              ].map((bucket) => (
                <div key={bucket.key} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono text-muted">
                    <span>{bucket.label}</span>
                    <span className="text-zinc-200">{(params[bucket.key as keyof SimulationInput] as number * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={params[bucket.key as keyof SimulationInput] as number}
                    onChange={(e) => handleChange(bucket.key as keyof SimulationInput, parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Withdrawal */}
          <div className="space-y-4 p-5 rounded-2xl bg-zinc-900/30 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Withdrawal Strategy</span>
              <button 
                onClick={() => handleChange('useDynamicWithdrawal', !params.useDynamicWithdrawal)}
                className={`w-8 h-4 rounded-full transition-colors relative ${params.useDynamicWithdrawal ? 'bg-teal' : 'bg-zinc-700'}`}
              >
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${params.useDynamicWithdrawal ? 'left-4.5' : 'left-0.5'}`} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-zinc-900/50 border border-border/30">
                <div className="text-[10px] font-bold text-zinc-400 mb-1">
                  {params.useDynamicWithdrawal ? "Guyton-Klinger Guardrails" : "Fixed Inflation-Adjusted"}
                </div>
                <p className="text-[10px] text-muted leading-relaxed">
                  {params.useDynamicWithdrawal 
                    ? "Adjusts spending based on market performance to prevent portfolio depletion." 
                    : "Standard 4% rule approach with fixed annual inflation adjustments."}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono text-muted">
                  <span>Inflation Rate</span>
                  <span className="text-zinc-200">{(params.inflationRate * 100).toFixed(1)}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="0.1"
                  step="0.001"
                  value={params.inflationRate}
                  onChange={(e) => handleChange('inflationRate', parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isAutoRunning && (
        <button 
          onClick={onRun}
          className="w-full py-3 bg-teal text-white rounded-xl font-bold hover:bg-teal/90 transition-all shadow-xl shadow-teal/10"
        >
          Run Simulation
        </button>
      )}
    </div>
  );
}
