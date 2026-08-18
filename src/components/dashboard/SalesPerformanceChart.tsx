'use client';

import { useEffect, useState } from 'react';
import { DashboardSalesPoint } from '@/types/dashboard.types';

interface Props {
  series: DashboardSalesPoint[];
}

const SalesPerformanceChart = ({ series }: Props) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="h-72 animate-pulse rounded-2xl bg-slate-50" />;
  }

  const data =
    series.length > 0
      ? series
      : [{ label: '—', total: 0 }];

  const values = data.map((d) => d.total);
  const maxValue = Math.max(...values, 1);
  const lineData = values.map((value) => (value / maxValue) * 100);

  const width = 600;
  const height = 280;
  const padding = 30;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;
  const pointSpacing =
    data.length > 1 ? plotWidth / (data.length - 1) : plotWidth;

  const points = lineData.map((value, index) => ({
    x: padding + index * pointSpacing,
    y: height - padding - (value / 100) * plotHeight,
  }));

  const pathD = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    ratio: t * 100,
    label:
      maxValue >= 1000
        ? `${Math.round((maxValue * t) / 1000)}k`
        : String(Math.round(maxValue * t)),
  }));

  const labelStep = Math.max(1, Math.ceil(data.length / 8));

  return (
    <div className="w-full">
      {series.length === 0 ? (
        <div className="flex h-72 items-center justify-center text-sm text-slate-400">
          No sales data for this period
        </div>
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full">
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
            <filter id="shadow">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
            </filter>
          </defs>

          {yTicks.map((tick) => (
            <line
              key={`grid-${tick.ratio}`}
              x1={padding}
              y1={height - padding - (tick.ratio / 100) * plotHeight}
              x2={width - padding}
              y2={height - padding - (tick.ratio / 100) * plotHeight}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}

          <path
            d={pathD}
            stroke="#10b981"
            strokeWidth="3"
            fill="none"
            filter="url(#shadow)"
          />

          <path
            d={`${pathD} L ${points[points.length - 1]?.x ?? padding} ${height - padding} L ${padding} ${height - padding} Z`}
            fill="url(#gradient)"
          />

          {points.map((point, index) => (
            <circle
              key={`point-${index}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="2"
            />
          ))}

          {yTicks.map((tick) => (
            <text
              key={`label-${tick.ratio}`}
              x={padding - 10}
              y={height - padding - (tick.ratio / 100) * plotHeight + 4}
              fontSize="11"
              fill="#64748b"
              textAnchor="end"
            >
              {tick.label}
            </text>
          ))}

          {data.map((point, index) =>
            index % labelStep === 0 || index === data.length - 1 ? (
              <text
                key={`x-label-${index}`}
                x={padding + (data.length > 1 ? (index / (data.length - 1)) * plotWidth : 0)}
                y={height - 8}
                fontSize="10"
                fill="#64748b"
                textAnchor="middle"
              >
                {point.label}
              </text>
            ) : null
          )}
        </svg>
      )}
    </div>
  );
};

export default SalesPerformanceChart;
