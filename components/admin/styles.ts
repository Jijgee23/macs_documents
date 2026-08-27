import type { CSSProperties } from "react";

export const fieldStyle: CSSProperties = {
  border: "1px solid var(--br)",
  background: "var(--inp)",
  color: "var(--tx)",
  borderRadius: 8,
};

export const primaryButtonStyle: CSSProperties = {
  background: "var(--brd)",
  color: "#fff",
  borderRadius: 8,
};

export const errorBannerStyle: CSSProperties = {
  background: "var(--brd-l)",
  color: "var(--brd)",
  border: "1px solid var(--brd-b)",
  borderRadius: 8,
};

export const cardStyle: CSSProperties = {
  border: "1px solid var(--br)",
  borderRadius: 8,
};

export const linkStyle: CSSProperties = { color: "var(--brd)" };
export const mutedStyle: CSSProperties = { color: "var(--mu)" };
