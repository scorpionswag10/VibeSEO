import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { format } from "date-fns";
import { type RankHistory } from "@shared/schema";

interface KeywordRankChartProps {
  history: RankHistory[];
}

export function KeywordRankChart({ history }: KeywordRankChartProps) {
  const chartData = history.map((h) => ({
    date: format(new Date(h.checkedAt), "MMM dd"),
    google: h.googleRank,
    bing: h.bingRank,
    duckduckgo: h.ddgRank,
  }));

  return (
    <div className="h-[400px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#9ca3af" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            reversed={true}
            domain={[1, 100]}
            label={{ value: 'Rank', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: 12 } }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
          <Line
            type="monotone"
            dataKey="google"
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            name="Google"
            animationDuration={1500}
          />
          <Line
            type="monotone"
            dataKey="bing"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
            name="Bing"
            animationDuration={1500}
          />
          <Line
            type="monotone"
            dataKey="duckduckgo"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
            name="DuckDuckGo"
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
