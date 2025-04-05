interface CircularProgressProps {
  value: number
  size: number
  strokeWidth: number
  color: string
}

export function CircularProgress({ value, size, strokeWidth, color }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const dash = (value * circumference) / 100

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeOpacity="0.1"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - dash}
        strokeLinecap="round"
      />
    </svg>
  )
}

