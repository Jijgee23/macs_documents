"use client";

export function ConfirmButton({
  children,
  className,
  style,
  message,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  message: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      style={style}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
