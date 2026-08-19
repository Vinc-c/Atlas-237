interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 36, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Atlas CRM logo"
    >
      <rect width="48" height="48" rx="12" fill="#0176d3" />
      <path
        d="M24 10 L24 38 M24 10 L14 38 M24 10 L34 38 M16 26 L32 26"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="38" r="2.5" fill="white" />
    </svg>
  );
}
