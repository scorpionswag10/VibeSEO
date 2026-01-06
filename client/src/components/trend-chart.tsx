import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { type RankHistory } from "@shared/schema";
import { format } from 'date-fns';

interface TrendChartProps {
  data: RankHistory[];
  keywordTerm: string;
}

export function TrendChart({ data, keywordTerm }: TrendChartProps) {
  // Process data for the chart, sort by date
  const chartData = [...data].sort((a, b) => 
    new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime()
  ).map(item => ({
    date: format(new Date(item.checkedAt), 'MMM dd'),
    google: item.googleRank || null,
    bing: item.bingRank || null,
  }));

  // Calculate stats
  const currentRank = chartData[chartData.length - 1]?.google;
  const previousRank = chartData[chartData.length - 2]?.google;
  const change = previousRank && currentRank ? previousRank - currentRank : 0; // Positive is good (rank went down)

  return (
    <Card className="border-border bg-card/40 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium">Ranking History</CardTitle>
            <CardDescription>Performance for "{keywordTerm}"</CardDescription>
          </div>
          {currentRank && (
            <div className="text-right">
              <div className="text-2xl font-bold text-white">#{currentRank}</div>
              {change !== 0 && (
                <div className={`text-xs font-medium ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {change > 0 ? '▲' : '▼'} {Math.abs(change)} positions
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="colorGoogle" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                reversed={true} // Rank 1 is at the top
                domain={[1, 'auto']}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line 
                type="monotone" 
                dataKey="google" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3} 
                dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: '#0f172a' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={1500}
              />
              <Line 
                type="monotone" 
                dataKey="bing" 
                stroke="#0ea5e9" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 4 }}
                hide={true} // Hidden by default to keep it clean, could be a toggle
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
