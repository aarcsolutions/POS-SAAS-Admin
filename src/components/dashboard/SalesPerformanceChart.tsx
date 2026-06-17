'use client';

import { useEffect, useState } from 'react';

const SalesPerformanceChart = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="h-72 bg-slate-50 rounded-2xl animate-pulse" />;
  }

  // Data for the chart
  const data = [35, 58, 44, 72, 64, 88, 76, 92, 67, 83, 79, 96];
  const maxValue = Math.max(...data);
  const lineData = data.map((value) => (value / maxValue) * 100);

  // Generate SVG path for line chart
  const width = 600;
  const height = 280;
  const padding = 30;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;
  const pointSpacing = plotWidth / (data.length - 1);

  const points = lineData.map((value, index) => ({
    x: padding + index * pointSpacing,
    y: height - padding - (value / 100) * plotHeight,
  }));

  const pathD = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-72">
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          <filter id="shadow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
          </filter>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((value) => (
          <line
            key={`grid-${value}`}
            x1={padding}
            y1={height - padding - (value / 100) * plotHeight}
            x2={width - padding}
            y2={height - padding - (value / 100) * plotHeight}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}

        {/* Main line */}
        <path d={pathD} stroke="#10b981" strokeWidth="3" fill="none" filter="url(#shadow)" />

        {/* Area under line */}
        <path
          d={`${pathD} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`}
          fill="url(#gradient)"
        />

        {/* Data points */}
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

        {/* Y-axis labels */}
        {[0, 25, 50, 75, 100].map((value) => (
          <text
            key={`label-${value}`}
            x={padding - 10}
            y={height - padding - (value / 100) * plotHeight + 4}
            fontSize="12"
            fill="#64748b"
            textAnchor="end"
          >
            {value}%
          </text>
        ))}

        {/* X-axis labels */}
        {data.map((_, index) => (
          <text
            key={`x-label-${index}`}
            x={padding + (index / (data.length - 1)) * plotWidth}
            y={height - 10}
            fontSize="12"
            fill="#64748b"
            textAnchor="middle"
          >
            Day {index + 1}
          </text>
        ))}
      </svg>
    </div>
  );
};

export default SalesPerformanceChart;
