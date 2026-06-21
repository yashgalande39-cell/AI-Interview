/**
 * MetricRing — SVG circular progress ring
 * Props: value (0-100), size, strokeWidth, color, label, sublabel, animate
 */
export default function MetricRing({
  value = 0,
  size = 80,
  strokeWidth = 5,
  color = '#6366F1',
  trackColor = 'rgba(255,255,255,0.06)',
  label,
  sublabel,
  className = '',
  animate = true,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  const colorMap = {
    blue:    '#3B82F6',
    violet:  '#8B5CF6',
    cyan:    '#06B6D4',
    indigo:  '#6366F1',
    emerald: '#10B981',
    amber:   '#F59E0B',
    rose:    '#EF4444',
  };

  const resolvedColor = colorMap[color] || color;

  const scoreColor = value >= 80 ? '#10B981' : value >= 60 ? '#F59E0B' : '#EF4444';
  const ringColor = label ? scoreColor : resolvedColor;

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Fill */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{
              transition: animate ? 'stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)' : 'none',
              filter: `drop-shadow(0 0 6px ${ringColor}60)`,
            }}
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold text-white leading-none" style={{ fontSize: size * 0.22 }}>
            {Math.round(value)}
          </span>
          {!label && <span className="text-slate-500 leading-none" style={{ fontSize: size * 0.13 }}>/ 100</span>}
        </div>
      </div>
      {label && (
        <div className="text-center">
          <p className="text-xs font-medium text-slate-300">{label}</p>
          {sublabel && <p className="text-[10px] text-slate-500">{sublabel}</p>}
        </div>
      )}
    </div>
  );
}
