import Image from "next/image";
import logo from "@/public/macs-logo.svg";

export function Logo({ size = "sm" }: { size?: "sm" | "lg" }) {
  const box = size === "lg" ? 58 : 34;

  return (
    <Image
      src={logo}
      alt="MACS"
      width={box}
      height={box}
      priority
      className="shrink-0"
      style={{ width: box, height: box }}
    />
  );
}
