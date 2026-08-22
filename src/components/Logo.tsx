interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 36, className = '' }: LogoProps) {
  return (
    <img
      src="/branding/atlas-logo.png"
      width={size}
      height={size}
      alt="Atlas CRM logo"
      className={className}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
}
