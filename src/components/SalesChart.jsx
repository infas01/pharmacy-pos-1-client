// src/components/SalesChart.jsx
// data: [{ date: 'YYYY-MM-DD', total: number }]
export default function SalesChart({ data = [], height = 260 }) {
  const w = 800;
  const h = height;
  const m = { top: 16, right: 16, bottom: 44, left: 56 };
  const cw = w - m.left - m.right;
  const ch = h - m.top - m.bottom;

  const vals = data.map((d) => Number(d.total || 0));
  const maxY = Math.max(1, Math.max(...vals, 0));
  const x = (i) => (data.length <= 1 ? cw / 2 : (i / (data.length - 1)) * cw);
  const y = (v) => ch - (v / maxY) * ch;

  const path = data
    .map(
      (d, i) => `${i === 0 ? 'M' : 'L'} ${m.left + x(i)} ${m.top + y(d.total)}`
    )
    .join(' ');

  const yTicks = 4;
  const yTickVals = Array.from(
    { length: yTicks + 1 },
    (_, i) => (maxY / yTicks) * i
  );

  const xStep = Math.ceil((data.length || 1) / 6); // ~6 labels

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[260px]">
        {/* Y grid + labels */}
        {yTickVals.map((tv, i) => (
          <g key={i}>
            <line
              x1={m.left}
              y1={m.top + y(tv)}
              x2={m.left + cw}
              y2={m.top + y(tv)}
              stroke="#e5e7eb"
            />
            <text
              x={m.left - 8}
              y={m.top + y(tv)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-slate-500 text-[10px]"
            >
              {Math.round(tv).toLocaleString()}
            </text>
          </g>
        ))}

        {/* X labels */}
        {data.map((d, i) =>
          i % xStep === 0 ? (
            <text
              key={d.date}
              x={m.left + x(i)}
              y={m.top + ch + 14}
              textAnchor="middle"
              className="fill-slate-500 text-[10px]"
            >
              {d.date.slice(5)}
              {/* MM-DD */}
            </text>
          ) : null
        )}

        {/* Line path */}
        <path d={path} fill="none" stroke="#60a5fa" strokeWidth="2" />

        {/* Points */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={m.left + x(i)}
            cy={m.top + y(d.total)}
            r="2.5"
            fill="#3b82f6"
          />
        ))}
      </svg>
    </div>
  );
}
