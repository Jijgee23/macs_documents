export function Logo({ size = "sm" }: { size?: "sm" | "lg" }) {
  const box = size === "lg" ? 58 : 34;
  const radius = size === "lg" ? 14 : 9;
  const fontSize = size === "lg" ? 19 : 11.5;

  return (
    <div
      className="flex shrink-0 items-center justify-center font-bold text-white"
      style={{
        width: box,
        height: box,
        borderRadius: radius,
        background: "linear-gradient(135deg,#991b1b 0%,#7f1d1d 100%)",
        boxShadow: "0 2px 8px rgba(153,27,27,.35)",
        fontFamily: "ui-monospace, monospace",
        fontSize,
        letterSpacing: "-0.5px",
      }}
    >
      IS
    </div>
  );
}
