"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const marketData = [
  { year: '2022', demand: 42 },
  { year: '2023', demand: 54 },
  { year: '2024', demand: 68 },
  { year: '2025', demand: 79 },
  { year: '2026', demand: 91 },
];

export default function MarketChart() {
  return (
    <div className="w-full h-full rounded-xl bg-card/80 border border-border p-3 sm:p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={marketData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
          <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '12px',
            }}
          />
          <Line
            type="monotone"
            dataKey="demand"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
            activeDot={{ r: 6, fill: 'hsl(var(--accent))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
