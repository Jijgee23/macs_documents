export function Sparkle({ size = 24, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M12 2.5 L14.2 9.3 L21 12 L14.2 14.7 L12 21.5 L9.8 14.7 L3 12 L9.8 9.3 Z" />
    </svg>
  );
}
