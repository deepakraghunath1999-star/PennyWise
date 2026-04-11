import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { SimulationResult } from "@/lib/monteCarlo";
import { formatCompactNumber } from "@/lib/utils";

interface FanChartProps {
  result: SimulationResult | null;
}

export function FanChart({ result }: FanChartProps) {
  if (!result) return null;

  const data = result.pctPaths.p50.map((p, i) => ({
    age: p.age,
    p50: p.balance,
    p10: result.pctPaths.p10[i].balance,
    p90: result.pctPaths.p90[i].balance,
  }));

  return (
    <div className="h-[400px] w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="colorP90" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
          <XAxis 
            dataKey="age" 
            stroke="#737373" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            label={{ value: 'Age', position: 'insideBottom', offset: -5, fill: '#737373', fontSize: 10 }}
          />
          <YAxis 
            stroke="#737373" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `$${formatCompactNumber(value)}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '12px' }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
            labelStyle={{ color: '#737373', marginBottom: '4px' }}
          />
          <Legend verticalAlign="top" height={36}/>
          
          <Area 
            type="monotone" 
            dataKey="p90" 
            fill="url(#colorP90)" 
            stroke="#14b8a6" 
            strokeWidth={1}
            strokeDasharray="5 5"
            name="90th Percentile" 
          />
          <Line 
            type="monotone" 
            dataKey="p50" 
            stroke="#f59e0b" 
            strokeWidth={3} 
            dot={false} 
            name="Median Path" 
          />
          <Line 
            type="monotone" 
            dataKey="p10" 
            stroke="#ef4444" 
            strokeWidth={1} 
            strokeDasharray="5 5"
            dot={false} 
            name="10th Percentile" 
          />
          
          {/* Retirement vertical line */}
          <line 
            x1={result.retirementAge} 
            y1={0} 
            x2={result.retirementAge} 
            y2={1000000} 
            stroke="#737373" 
            strokeDasharray="3 3" 
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
