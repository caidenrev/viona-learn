export function VionaLogo({
  className = "w-7 h-7",
  mono = false,
}: {
  className?: string;
  mono?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 256 256"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        fill={mono ? "currentColor" : "#E05252"}
        stroke={mono ? "currentColor" : "#4A3E3D"}
        strokeWidth="6"
        strokeLinejoin="round"
        d="M 31.0 75.0 A 22 22 0 0 1 69.1 53.0 L 78.1 68.6 L 40.0 90.6 Z"
      />
      <path
        fill={mono ? "currentColor" : "#D6D1CB"}
        stroke={mono ? "currentColor" : "#4A3E3D"}
        strokeWidth="6"
        strokeLinejoin="round"
        d="M 40.0 90.6 L 78.1 68.6 L 83.1 77.2 L 45.0 99.2 Z"
      />
      <path
        fill={mono ? "currentColor" : "#F4B41A"}
        stroke={mono ? "currentColor" : "#4A3E3D"}
        strokeWidth="6"
        strokeLinejoin="round"
        d="M 45.0 99.2 L 83.1 77.2 L 143.1 181.2 A 22 22 0 0 1 105.0 203.2 Z"
      />
      <path
        fill={mono ? "none" : "#FFFFFF"}
        stroke={mono ? "currentColor" : "#4A3E3D"}
        strokeWidth="6"
        strokeLinejoin="round"
        d="M 187.0 53.0 A 22 22 0 0 1 225.1 75.0 L 211.1 99.2 L 199.8 92.7 L 195.3 100.5 L 206.6 107.0 L 197.1 123.5 L 185.8 117.0 L 181.3 124.8 L 192.6 131.3 L 183.1 147.7 L 171.8 141.2 L 167.3 149.0 L 178.6 155.5 L 160.4 187.1 L 135.0 143.1 Z"
      />
    </svg>
  );
}
