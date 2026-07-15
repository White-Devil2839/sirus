import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const PALETTE = ['#5b45f0', '#2f69ff', '#198c61', '#f6bf2f', '#d94b4b', '#7a5af8'];

// Big compliance-score donut with centered percentage (image 4, top-left).
export function ComplianceDonut({ score = 0, size = 200 }) {
  const data = [
    { name: 'score', value: score },
    { name: 'rest', value: Math.max(0, 100 - score) },
  ];
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <linearGradient id="donutGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6d5efc" />
              <stop offset="100%" stopColor="#2f69ff" />
            </linearGradient>
          </defs>
          <Pie
            data={data}
            innerRadius={size * 0.34}
            outerRadius={size * 0.46}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
            isAnimationActive={false}
          >
            <Cell fill="url(#donutGrad)" />
            <Cell fill="rgb(var(--ink) / 0.08)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-4xl font-black leading-none text-ink">
            {Math.round(score)}<span className="text-xl align-top text-muted/80">%</span>
          </p>
          <p className="mt-1 text-sm font-bold text-brand-600">Compliant</p>
        </div>
      </div>
    </div>
  );
}

// Horizontal metric bar (Labor Law Compliance 95%, etc.)
export function MetricBar({ label, value }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const color = v >= 80 ? '#5b45f0' : v >= 50 ? '#2f69ff' : '#f6bf2f';
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-muted">{label}</span>
        <span className="font-bold text-ink">{v}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10">
        <div className="h-full rounded-full transition-all" style={{ width: `${v}%`, background: color }} />
      </div>
    </div>
  );
}

// Impact as 5 dots (image 4 findings table).
export function ImpactDots({ impact = 0, level = 'Medium' }) {
  const color = level === 'High' ? '#d94b4b' : level === 'Low' ? '#198c61' : '#f6bf2f';
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="h-2 w-4 rounded-sm" style={{ background: i <= impact ? color : '#e9edf6' }} />
      ))}
    </div>
  );
}

export function ConfidenceBar({ confidence = 0 }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink/10">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${confidence}%` }} />
      </div>
      <span className="text-xs font-semibold text-muted">{confidence}%</span>
    </div>
  );
}

// Render a numericalData item as a bar or donut chart.
export function NumericalChart({ item }) {
  const series = (item.series || []).map((s, i) => ({ ...s, fill: PALETTE[i % PALETTE.length] }));
  if (item.chartType === 'donut') {
    return (
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={series} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
            {series.map((s, i) => (
              <Cell key={i} fill={s.fill} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={series} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
        <Tooltip cursor={{ fill: '#f2f1ff' }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {series.map((s, i) => (
            <Cell key={i} fill={s.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ChartLegend({ series = [] }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {series.map((s, i) => (
        <span key={i} className="flex items-center gap-1.5 text-xs font-medium text-muted">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
          {s.name}
        </span>
      ))}
    </div>
  );
}
